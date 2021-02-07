import { addDays, addHours, format, getTime, isAfter, max } from 'date-fns'
import { listGroups } from '../data'
import firebase from '../firebase'
import { fetch } from '../utils/fetcher'
import { parse } from '../utils/parser'
import { Activity, Schedule, Timeline } from '../models'
import { cyan, green, red, yellow } from 'chalk'

const parseTimelines = (timelines: Timeline[], groupId: string) => {
  return timelines.reduce((carry, timeline) => {
    const schedules = parse(timeline, groupId)
    return [...carry, ...schedules]
  }, [] as Schedule[])
}

const updateSchedule = async (schedule: Schedule, groupId: string) => {
  console.log('updating activities at %s', format(schedule.scheduledAt, 'P'))

  // between 06:00 to 30:00
  // スケジュールに記載されている日付の6:00、ただしスケジュールが公開された日時がそれ以降の場合は後者
  const from = max([schedule.publishedAt, addHours(schedule.scheduledAt, 6)])
  // スケジュールに記載されている日付の次の日の6:00まで
  const to = addHours(addDays(schedule.scheduledAt, 1), 6)

  console.log('between %s to %s', format(from, 'Pp'), format(to, 'Pp'))

  // upserting activities
  const activities = schedule.activities.filter((activity) => {
    return isAfter(activity.startedAt, from)
  })
  const hash = activities.reduce((carry, activity) => {
    const uid = getUid(activity)
    return {
      ...carry,
      [uid]: activity,
    }
  }, {} as { [uid: string]: Activity })

  // stored activities
  const snapshot = await firebase
    .firestore()
    .collection('activities')
    .where('sourceGroupId', '==', groupId)
    .where('startedAt', '>=', from)
    .where('startedAt', '<', to)
    .get()
  const stored = snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      ...data,
      id: doc.id,
      startedAt: data.startedAt.toDate(),
    } as Activity & { id: string }
  })
  const storedHash = stored.reduce((carry, activity) => {
    const uid = getUid(activity)
    return {
      ...carry,
      [uid]: activity,
    }
  }, {} as { [uid: string]: Activity & { id: string } })

  const deletings = stored.filter((activity) => {
    const uid = getUid(activity)
    return !hash[uid]
  })
  const updatings = activities.reduce((carry, activity) => {
    const uid = getUid(activity)
    const stored = storedHash[uid]
    return stored ? [...carry, { ...stored, ...activity }] : carry
  }, [] as (Activity & { id: string })[])
  const insertings = activities.reduce((carry, activity) => {
    const uid = getUid(activity)
    const stored = storedHash[uid]
    return stored ? carry : [...carry, activity]
  }, [] as Activity[])

  await deletings
    .reduce((carry, { id }) => {
      const ref = firebase.firestore().collection('activities').doc(id)
      return carry.delete(ref)
    }, firebase.firestore().batch())
    .commit()
  await updatings
    .reduce((carry, { id, ...activity }) => {
      const ref = firebase.firestore().collection('activities').doc(id)
      return carry.update(ref, {
        ...activity,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      })
    }, firebase.firestore().batch())
    .commit()
  await insertings
    .reduce((carry, activity) => {
      const ref = firebase.firestore().collection('activities').doc()
      return carry.set(ref, {
        ...activity,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      })
    }, firebase.firestore().batch())
    .commit()

  console.log(
    red('%d activities deleted') +
      ', ' +
      yellow('%d activities updated') +
      ' and ' +
      cyan('%d activities inserted'),
    deletings.length,
    updatings.length,
    insertings.length
  )
}

const getUid = (activity: Activity) =>
  `${activity.ownerId}_${getTime(activity.startedAt)}`

export const fetchTimelines = async (groupId?: string): Promise<void> => {
  console.log(green('fetching timelines'))
  const groups = listGroups({ sourceable: true })
  for (const group of groups) {
    if (groupId && group.id !== groupId) {
      continue
    }
    console.log(green('fetching %s timelines'), group.id)
    const timelines = await fetch(group.twitter.screenName)
    const schedules = parseTimelines(timelines, group.id)
    for (const schedule of schedules) {
      await updateSchedule(schedule, group.id)
    }
    console.log(green('fetched %s timelines'), group.id)
  }
  console.log(green('fetched timelines'))
}
