import * as functions from 'firebase-functions'
import { TwitterClient } from 'twitter-api-client'

export const twitterClient = new TwitterClient({
  apiKey: functions.config().twitter.api_key,
  apiSecret: functions.config().twitter.api_secret,
  accessToken: functions.config().twitter.access_token,
  accessTokenSecret: functions.config().twitter.access_token_secret,
})
