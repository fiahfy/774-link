import * as functions from 'firebase-functions'
import { updateActivitiesWithTimelines } from './actions/update-activities-with-timelines'
import { updateActivitiesWithVideos } from './actions/update-activities-with-videos'

exports.updateActivitiesWithTimelines = functions
  .region('asia-northeast1')
  .pubsub.schedule('every 1 hours')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    try {
      await updateActivitiesWithTimelines()
    } catch (e) {
      console.error(e)
    }
    return null
  })

exports.updateActivitiesWithVideos = functions
  .region('asia-northeast1')
  .pubsub.schedule('every 6 hours')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    try {
      await updateActivitiesWithVideos()
    } catch (e) {
      console.error(e)
    }
    return null
  })
