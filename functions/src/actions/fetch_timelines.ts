import { addDays, getTime, isAfter, max } from 'date-fns'
import groups from '774-link/src/data/groups.json'
import firebase from '../firebase'
import { fetch } from '../utils/fetcher'
import { parse } from '../utils/parser'
import { Schedule, Timeline } from '../models'

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

  console.log('updating events: from=%s, to=%s', from, to)

  const events = schedule.events.filter((event) => {
    return isAfter(event.startedAt, from)
  })

  // const eventIds = events.map(() => {

  // })

  const snapshot = await firebase
    .firestore()
    .collection('events')
    .where('groupId', '==', groupId)
    .where('startedAt', '>=', from)
    .where('startedAt', '<', to)
    .get()
  const exists = snapshot.docs.map((doc) => {
    return {
      ...doc.data(),
      id: doc.id,
    } as Event & { id: string }
  })
  console.log(exists)
  // const deletes = exists.filter((event) => {
  //   const uid = getUniqueIdWithDoc(event)
  //   if (eventIds[uid] === false) {
  //     eventIds[uid] = event.id
  //     return false
  //   }
  //   return true
  // })
}

export const fetchTimelines = async (): Promise<void> => {
  for (const [groupId, group] of Object.entries(groups)) {
    console.log(group)
    const timelines = await fetch(group.twitterScreenName)
    const schedules = parseTimelines(timelines, groupId)
    const extracted = extractSchedule(schedules)
    console.log(extracted)
    for (const schedule of extracted) {
      await updateSchedule(schedule, groupId)
    }
    return
  }
}
