import fs from 'fs'

const main = async () => {
  const key = fs.readFileSync('./key.json', 'utf8')
  process.env.FIREBASE_SERVICE_ACCOUNT = key

  const config = JSON.parse(fs.readFileSync('./.runtimeconfig.json', 'utf8'))
  process.env.TWITTER_CONSUMER_KEY = config.twitter.consumer_key
  process.env.TWITTER_CONSUMER_SECRET = config.twitter.consumer_secret
  process.env.TWITTER_ACCESS_TOKEN_KEY = ''
  process.env.TWITTER_ACCESS_TOKEN_SECRET = ''

  const { fetchTimelines } = await import('./actions/fetch_timelines')
  await fetchTimelines()
}

main().catch((e) => {
  console.error(e)
})
