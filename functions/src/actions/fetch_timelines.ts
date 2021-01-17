import { addDays, addHours, getTime, isAfter, max } from 'date-fns'
import { groups } from '../data'
import firebase from '../firebase'
import { fetch } from '../utils/fetcher'
import { parse } from '../utils/parser'
import { Activity, Schedule, Timeline } from '../models'

const parseTimelines = (timelines: Timeline[], groupId: string) => {
  return timelines.reduce((carry, timeline) => {
    const schedules = parse(timeline, groupId)
    return [...carry, ...schedules]
  }, [] as Schedule[])
}

const extractSchedule = (schedules: Schedule[]) => {
  return Object.values(
    schedules
      .reverse() // order by date asc
      .reduce(
        (carry, schedule) => {
          const timestamp = getTime(schedule.date)
          return {
            ...carry,
            [timestamp]: schedule, // overwrite with the latest schedule for each day
          }
        },
        {} as { [timestamp: number]: Schedule }
      )
  )
}

const updateSchedule = async (schedule: Schedule, groupId: string) => {
  console.log('updating activities of %s at %s', groupId, schedule.date)

  // between 06:00 to 30:00
  const from = max([schedule.publishedAt, addHours(schedule.date, 6)])
  const to = addHours(addDays(schedule.date, 1), 6)

  console.log('between %s to %s', from, to)

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
    .where('groupId', '==', groupId)
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
    '%d activities deleted, %d activities updated and %d activities inserted',
    deletings.length,
    updatings.length,
    insertings.length
  )
}

const getUid = (activity: Activity) => `${activity.memberId}_${activity.startedAt.getTime()}`

export const fetchTimelines = async (groupId?: string): Promise<void> => {
  for (const group of groups) {
    if (groupId && group.id !== groupId) {
      continue
    }
    const timelines = await fetch(group.twitterScreenName)
    const schedules = parseTimelines(timelines, group.id)
    const extracted = extractSchedule(schedules)
    for (const schedule of extracted) {
      await updateSchedule(schedule, group.id)
    }
  }
}
