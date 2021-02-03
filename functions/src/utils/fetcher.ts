import * as functions from 'firebase-functions'
import { TwitterClient } from 'twitter-api-client'
import { Timeline } from '../models'

const client = new TwitterClient({
  apiKey: functions.config().twitter.api_key,
  apiSecret: functions.config().twitter.api_secret,
  accessToken: functions.config().twitter.access_token,
  accessTokenSecret: functions.config().twitter.access_token_secret,
})

export const fetch = async (screenName: string): Promise<Timeline[]> => {
  const data = await client.tweets.statusesUserTimeline({
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
