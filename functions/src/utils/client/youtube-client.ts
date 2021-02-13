import * as functions from 'firebase-functions'
import { google } from 'googleapis'

export const youtubeClient = google.youtube({
  version: 'v3',
  auth: functions.config().google.api_key,
})
