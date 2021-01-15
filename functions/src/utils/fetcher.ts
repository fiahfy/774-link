import * as functions from 'firebase-functions'
import Twitter from 'twitter'
import { Timeline } from '../models'

/* eslint-disable @typescript-eslint/no-non-null-assertion */
const client = new Twitter({
  consumer_key: functions.config().twitter.consumer_key,
  consumer_secret: functions.config().twitter.consumer_secret,
  access_token_key: functions.config().twitter.access_token_key,
  access_token_secret: functions.config().twitter.access_token_secret,
})
/* eslint-enable @typescript-eslint/no-non-null-assertion */

export const fetch = async (screenName: string): Promise<Timeline[]> => {
  const data = await client.get('statuses/user_timeline', {
    screen_name: screenName,
    tweet_mode: 'extended',
    count: 10,
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((d: any) => {
    return { createdAt: d.created_at, fullText: d.full_text }
  })
}
