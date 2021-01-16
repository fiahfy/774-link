import { addDays, addHours, getTime, isAfter, max } from 'date-fns'
import groups from '774-link/src/data/groups.json'
import firebase from '../firebase'
import { fetch } from '../utils/fetcher'
import { parse } from '../utils/parser'
import { Event, Schedule, Timeline } from '../models'

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
  console.log('updating events of %s at %s', groupId, schedule.date)

  // between 06:00 to 30:00
  const from = max([schedule.publishedAt, addHours(schedule.date, 6)])
  const to = addHours(addDays(schedule.date, 1), 6)

  console.log('between %s to %s', from, to)

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
    '%d events deleted, %d events updated and %d events inserted',
    deletings.length,
    updatings.length,
    insertings.length
  )
}

const getUid = (event: Event) => `${event.ownerId}_${event.startedAt.getTime()}`

export const fetchTimelines = async (groupId?: string): Promise<void> => {
  for (const [id, group] of Object.entries(groups)) {
    if (groupId && id !== groupId) {
      continue
    }
    const timelines = await fetch(group.twitterScreenName)
    const schedules = parseTimelines(timelines, id)
    const extracted = extractSchedule(schedules)
    for (const schedule of extracted) {
      await updateSchedule(schedule, id)
    }
  }
}
