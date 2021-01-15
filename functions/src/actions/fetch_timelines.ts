import { addDays, getTime, isAfter, max } from 'date-fns'
import groups from '774-link/src/data/groups.json'
import firebase from '../firebase'
import { fetch } from '../utils/fetcher'
import { parse } from '../utils/parser'
import { Event, Schedule, Timeline } from '../models'

const parseTimelines = (timelines: Timeline[], groupId: string) => {
  return timelines.reduce((carry: Schedule[], timeline: any) => {
    const schedules = parse(timeline, groupId)
    return [...carry, ...schedules]
  }, [])
}

const extractSchedule = (schedules: Schedule[]) => {
  return Object.values(
    schedules
      .reverse() // order by date asc
      .reduce(
        (carry: { [timestamp: number]: Schedule }, schedule: Schedule) => {
          const timestamp = getTime(schedule.date)
          return {
            ...carry,
            [timestamp]: schedule,
          }
        },
        {}
      )
  )
}

const updateSchedule = async (schedule: Schedule, groupId: string) => {
  console.log('updating events: group_id=%s, date=%s', groupId, schedule.date)

  const from = max([schedule.publishedAt, schedule.date])
  const to = addDays(schedule.date, 1)

  console.log('target period: from=%s, to=%s', from, to)

  // upserting events
  const events = schedule.events.filter((event) => {
    return isAfter(event.startedAt, from)
  })
  const hash = events.reduce((carry, event) => {
    const uid = `${event.ownerId}_${event.startedAt.getTime()}`
    return {
      ...carry,
      [uid]: event,
    }
  }, {} as { [uid: string]: Event })

  // stored events
  const snapshot = await firebase
    .firestore()
    .collection('events')
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
    } as Event & { id: string }
  })
  const storedHash = stored.reduce((carry, event) => {
    const uid = getUid(event)
    return {
      ...carry,
      [uid]: event,
    }
  }, {} as { [uid: string]: Event & { id: string } })

  const deletings = stored.filter((event) => {
    const uid = getUid(event)
    return !hash[uid]
  })
  const updatings = events.reduce((carry, event) => {
    const uid = getUid(event)
    const stored = storedHash[uid]
    return stored ? [...carry, { ...stored, ...event }] : carry
  }, [] as (Event & { id: string })[])
  const insertings = events.reduce((carry, event) => {
    const uid = getUid(event)
    const stored = storedHash[uid]
    return stored ? carry : [...carry, event]
  }, [] as Event[])

  await deletings
    .reduce((carry, { id }) => {
      const ref = firebase.firestore().collection('events').doc(id)
      return carry.delete(ref)
    }, firebase.firestore().batch())
    .commit()
  await updatings
    .reduce((carry, { id, ...event }) => {
      const ref = firebase.firestore().collection('events').doc(id)
      return carry.update(ref, {
        ...event,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      })
    }, firebase.firestore().batch())
    .commit()
  await insertings
    .reduce((carry, event) => {
      const ref = firebase.firestore().collection('events').doc()
      return carry.set(ref, {
        ...event,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      })
    }, firebase.firestore().batch())
    .commit()

  console.log(
    'updated events: deleted=%d, updated=%d, inserted=%d',
    deletings.length,
    updatings.length,
    insertings.length
  )
}

const getUid = (event: Event) => `${event.ownerId}_${event.startedAt.getTime()}`

export const fetchTimelines = async (): Promise<void> => {
  for (const [groupId, group] of Object.entries(groups)) {
    const timelines = await fetch(group.twitterScreenName)
    const schedules = parseTimelines(timelines, groupId)
    const extracted = extractSchedule(schedules)
    for (const schedule of extracted) {
      await updateSchedule(schedule, groupId)
      return
    }
    return
  }
}
