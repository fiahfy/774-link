import Twitter from 'twitter'
import { Timeline } from '../models'

/* eslint-disable @typescript-eslint/no-non-null-assertion */
const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY!,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET!,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY!,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
})
/* eslint-enable @typescript-eslint/no-non-null-assertion */

export const fetch = async (screenName: string): Promise<Timeline[]> => {
  const data = await client.get('statuses/user_timeline', {
    screen_name: screenName,
    tweet_mode: 'extended',
    count: 20,
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((d: any) => {
    return { createdAt: d.created_at, fullText: d.full_text }
  })
}
