import { cyan, green, red, yellow } from 'chalk'
import {
  addDays,
  addHours,
  differenceInMinutes,
  format,
  getTime,
  isAfter,
  isEqual,
  max,
} from 'date-fns'
import { listGroups } from '../data'
import firebase from '../firebase'
import * as parser from '../utils/parser'
import { Activity, Schedule, Timeline } from '../models'
import { youtubeClient } from '../utils/client'

const fetch = async (channelId: string) => {
  const results = await youtubeClient.search.list({
    part: ['id'],
    channelId: '',
    order: 'date',
    type: ['video'],
    maxResults: 5,
  })
  console.log(results, results.data.items)
}

export const fetchVideos = async (groupId?: string): Promise<void> => {
  console.log(green('fetching videos'))
  const videos = await fetch('UC0Owc36U9lOyi9Gx9Ic-4qg')
  console.log(green('fetched videos'))
}
