import dotenv from 'dotenv'

dotenv.config({ path: '../.env.local'})

const main = async () => {
  const { fetchTimelines } = await import('./actions/fetch_timelines')
  await fetchTimelines()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
