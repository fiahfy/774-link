import { cyan, green, red, yellow } from 'chalk'
import {
  addDays,
  addHours,
  differenceInMinutes,
  format,
  getTime,
  isAfter,
  isEqual,
  max,
} from 'date-fns'
import { listGroups } from '../data'
import firebase from '../firebase'
import { Activity } from '../models'
import { twitterClient } from '../utils/client'
import { Schedule, Timeline, parseTimeline } from '../utils/parser'

const fetch = async (screenName: string): Promise<Timeline[]> => {
  const data = await twitterClient.tweets.statusesUserTimeline({
    screen_name: screenName,
    tweet_mode: 'extended',
    count: 10,
  })
  return data.map((d) => {
    return {
      id: d.id_str,
      createdAt: new Date(d.created_at),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fullText: (d as any).full_text,
    }
  })
}

const parse = (timelines: Timeline[], groupId: string) => {
  return timelines
    .reverse() // order by date asc
    .reduce((carry, timeline) => {
      // ツイートから1つ以上のスケジュールを取得
      const schedules = parseTimeline(timeline, groupId)
      return [...carry, ...schedules]
    }, [] as Schedule[])
    .reduce((carry, schedule) => {
      // 1つ前のスケジュールと比較し、スケジュール日が同じ かつ 投稿日が5分未満 の場合に同じスケジュールとみなしマージする
      const prev = carry[carry.length - 1]
      if (
        prev &&
        isEqual(schedule.scheduledAt, prev.scheduledAt) &&
        differenceInMinutes(schedule.publishedAt, prev.publishedAt) < 5
      ) {
        return [
          ...carry.slice(0, carry.length - 1),
          {
            ...prev,
            activities: [...prev.activities, ...schedule.activities],
          },
        ]
      }
      return [...carry, schedule]
    }, [] as Schedule[])
}

const updateActivities = async (schedule: Schedule, groupId: string) => {
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
    const uid = createUid(activity)
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
    const uid = createUid(activity)
    return {
      ...carry,
      [uid]: activity,
    }
  }, {} as { [uid: string]: Activity & { id: string } })

  const deletings = stored.filter((activity) => {
    // youtube の情報がない場合 かつ upsert の対象になっていない場合は削除対象とする
    const uid = createUid(activity)
    return !activity.youtube && !hash[uid]
  })
  const updatings = activities.reduce((carry, activity) => {
    const uid = createUid(activity)
    const stored = storedHash[uid]
    // すでに store にある場合は上書きしつつ更新対象とする
    return stored ? [...carry, { ...stored, ...activity }] : carry
  }, [] as (Activity & { id: string })[])
  const insertings = activities.reduce((carry, activity) => {
    const uid = createUid(activity)
    const stored = storedHash[uid]
    // まだ store にない場合は追加対象とする
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

const createUid = (activity: Activity) =>
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
    const schedules = parse(timelines, group.id)
    for (const schedule of schedules) {
      await updateActivities(schedule, group.id)
    }
    console.log(green('fetched %s timelines'), group.id)
  }
  console.log(green('fetched timelines'))
}
