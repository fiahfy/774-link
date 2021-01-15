import * as functions from 'firebase-functions'
import { fetchTimelines } from './actions/fetch_timelines'

exports.fetchTimelines = functions
  .region('asia-northeast1')
  .pubsub.schedule('every 1 hour')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    try {
      await fetchTimelines()
    } catch (e) {
      console.error(e)
    }
    return null
  })
