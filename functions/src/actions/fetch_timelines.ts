import { fetch } from '../utils/fetcher'
import { parse } from '../utils/parser'
import groups from '774-link/src/data/groups.json'

const parseData = (data: any) => {
  return data
    .reverse()
    .reducer((carry: Event[], timeline: any) => {
      const events = parse(timeline.full_text)
      return [...carry, ...events]
    }, [])
}

export const fetchTimelines = async () => {
  for (const group of Object.values(groups)) {
    console.log(group)
    const data = await fetch(group.twitter_screen_name)
    // console.log(data)
    data.map((s: any) => {
      console.log(s)
    })
    const events = parseData(data)
    console.log(events)
    return
  }
}
