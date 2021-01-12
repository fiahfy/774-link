import { getTime } from 'date-fns'
import groups from '774-link/src/data/groups.json'
import { fetch } from '../utils/fetcher'
import { parse } from '../utils/parser'
import { Schedule, Timeline } from '../models'

const parseTimelines = (timelines: Timeline[]) => {
  return timelines.reduce((carry: Schedule[], timeline: any) => {
    const schedules = parse(timeline)
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

const updateEvents = (groupId: string, schedule: Schedule) => {
  console.log('updating events: group_id=%s, date=%s', groupId, schedule.date)
}

export const fetchTimelines = async () => {
  for (const [groupId, group] of Object.entries(groups)) {
    console.log(group)
    const timelines = await fetch(group.twitter_screen_name)
    const schedules = parseTimelines(timelines)
    const extracted = extractSchedule(schedules)
    console.log(extracted)
    for (const schedule of extracted) {
      updateEvents(groupId, schedule)
    }
    return
  }
}
