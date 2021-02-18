import * as functions from 'firebase-functions'
import { fetchTimelines } from './actions/fetch-timelines'
import { fetchVideos } from './actions/fetch-videos'

exports.fetchTimelines = functions
  .region('asia-northeast1')
  .pubsub.schedule('every 1 hours')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    try {
      await fetchTimelines()
    } catch (e) {
      console.error(e)
    }
    return null
  })

exports.fetchVideos = functions
  .region('asia-northeast1')
  .pubsub.schedule('every 6 hours')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    try {
      await fetchVideos()
    } catch (e) {
      console.error(e)
    }
    return null
  })
