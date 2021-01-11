import { fetch } from '../utils/fetcher'
import groups from '774-link/src/data/groups.json'

export const fetchTimelines = async () => {
  for (const group of Object.values(groups)) {
    console.log(group)
    const data = await fetch(group.twitter_screen_name)
    // console.log(data)
    data.map((s) => {
      console.log(s)
    })
    return
  }
}
