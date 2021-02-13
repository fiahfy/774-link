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
import { listGroups, listMembers } from '../data'
import firebase from '../firebase'
import * as parser from '../utils/parser'
import { Activity, Member, Schedule, Timeline, Video } from '../models'
import { youtubeClient } from '../utils/client'

const fetch = async (channelId: string): Promise<Video[]> => {
  const results = await youtubeClient.search.list({
    part: ['id'],
    channelId,
    order: 'date',
    type: ['video'],
    maxResults: 5,
  })
  const videoIds =
    results.data.items?.reduce((carry, item) => {
      const id = item.id?.videoId
      return id ? [...carry, id] : carry
    }, [] as string[]) ?? []
  const videos = await youtubeClient.videos.list({
    part: ['id', 'snippet', 'liveStreamingDetails'],
    id: videoIds,
  })
  return (
    videos.data.items?.reduce((carry, item) => {
      const id = item.id
      const title = item.snippet?.title ?? ''
      const description = item.snippet?.description ?? ''
      const startTime = item.liveStreamingDetails?.scheduledStartTime
      return id && startTime
        ? [
            ...carry,
            {
              id,
              title,
              description,
              startedAt: new Date(startTime),
            },
          ]
        : carry
    }, [] as Video[]) ?? []
  )
}

const convert = (video: Video, member: Member): Activity => {
  return {
    ownerId: member.id,
    groupId: member.groupId,
    memberIds: [],
    isHost: true,
    startedAt: video.startedAt,
    youtube: {
      videoId: video.id,
      title: video.title,
      description: video.description,
    },
  }
}

const updateActivities = async (activities: Activity[], memberId: string) => {
  console.log('updating activities for %s', memberId)

  // // upserting activities
  // const activities = schedule.activities.filter((activity) => {
  //   return isAfter(activity.startedAt, from)
  // })
  // const hash = activities.reduce((carry, activity) => {
  //   const uid = createUid(activity)
  //   return {
  //     ...carry,
  //     [uid]: activity,
  //   }
  // }, {} as { [uid: string]: Activity })

  // // stored activities
  // const snapshot = await firebase
  //   .firestore()
  //   .collection('activities')
  //   .where('groupId', '==', groupId)
  //   .where('startedAt', '>=', from)
  //   .where('startedAt', '<', to)
  //   .get()
  // const stored = snapshot.docs.map((doc) => {
  //   const data = doc.data()
  //   return {
  //     ...data,
  //     id: doc.id,
  //     startedAt: data.startedAt.toDate(),
  //   } as Activity & { id: string }
  // })
}

export const fetchVideos = async (memberId?: string): Promise<void> => {
  console.log(green('fetching videos'))
  const members = listMembers()
  for (const member of members) {
    if (memberId && member.id !== memberId) {
      continue
    }
    console.log(green('fetching %s videos'), member.id)
    const videos = await fetch(member.youtube.channelId)
    const activities = videos.map((video) => convert(video, member))
    await updateActivities(activities, member.id)
    console.log(green('fetched %s videos'), member.id)
  }
  console.log(green('fetched videos'))
}
