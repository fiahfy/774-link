import fs from 'fs'

const main = async () => {
  process.env.FIREBASE_SERVICE_ACCOUNT = fs.readFileSync('./key.json', 'utf8')

  const { fetchTimelines } = await import('./actions/fetch_timelines')
  await fetchTimelines()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
