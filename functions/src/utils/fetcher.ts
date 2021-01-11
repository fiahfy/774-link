import Twitter from 'twitter'

export const fetch = async (screenName: string): Promise<Twitter.ResponseData> => {
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY!,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET!,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY!,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
  })
  /* eslint-enable @typescript-eslint/no-non-null-assertion */
  const data = await client.get('statuses/user_timeline', {
    screen_name: screenName,
    tweet_mode: 'extended',
    count: 20,
  })
  return data
}
