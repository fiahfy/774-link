import fs from 'fs'
import { fetchTimelines } from './actions/fetch_timelines'

const main = async () => {
  const json = fs.readFileSync('./.runtimeconfig.json', 'utf8')
  const config = JSON.parse(json)

  process.env.TWITTER_CONSUMER_KEY = config.twitter.consumer_key
  process.env.TWITTER_CONSUMER_SECRET = config.twitter.consumer_secret
  process.env.TWITTER_ACCESS_TOKEN_KEY = ''
  process.env.TWITTER_ACCESS_TOKEN_SECRET = ''

  await fetchTimelines()
}

main().catch((e) => {
  console.error(e)
})
