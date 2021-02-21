import { cyan, green, red, yellow } from 'chalk'
import { format, getTime } from 'date-fns'
import { listMembers } from '../data'
import firebase from '../firebase'
import { Activity, Member } from '../models'
import { youtubeClient } from '../utils/client'

type Video = {
  id: string
  title: string
  description: string
  startedAt: Date
  thumbnailUrl?: string
}

const fetch = async (channelId: string): Promise<Video[]> => {
  const results = await youtubeClient.search.list({
    part: ['id'],
    channelId,
    order: 'date',
    type: ['video'],
    maxResults: 10,
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
      const startTime = item.liveStreamingDetails?.scheduledStartTime
      return id && startTime
        ? [
            ...carry,
            {
              id,
              title: item.snippet?.title ?? '',
              description: item.snippet?.description ?? '',
              startedAt: new Date(startTime),
              thumbnailUrl: item.snippet?.thumbnails?.standard?.url ?? undefined
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
    startedAt: video.startedAt,
    thumbnailUrl: video.thumbnailUrl,
    youtube: {
      videoId: video.id,
      title: video.title,
      description: video.description,
    },
  }
}

const upload = async (activity: Activity): Activity => {
  const { thumbnailUrl: originalUrl } = activity
  await firebase.storage().bucket().file('activities/id').save(blob)
  return { ...activity, thumbnailUrl: undefined }
}

const updateActivities = async (activities: Activity[], memberId: string) => {
  console.log('updating activities for %s', memberId)

  const from = activities[0].startedAt

  console.log('from %s', format(from, 'Pp'))

  // upserting activities
  const hash = activities.reduce((carry, activity) => {
    const uid = createUid(activity)
    return {
      ...carry,
      [uid]: activity,
    }
  }, {} as { [uid: string]: Activity })

  // stored activities
  const snapshot = await firebase
    .firestore()
    .collection('activities')
    .where('ownerId', '==', memberId)
    .where('startedAt', '>=', from)
    .get()
  const stored = snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      ...data,
      id: doc.id,
      startedAt: data.startedAt.toDate(),
    } as Activity & { id: string }
  })
  const storedHash = stored.reduce((carry, activity) => {
    const uid = createUid(activity)
    return {
      ...carry,
      [uid]: activity,
    }
  }, {} as { [uid: string]: Activity & { id: string } })

  const deletings = stored.filter((activity) => {
    // youtube の情報がある場合 かつ upsert の対象になっていない場合は削除対象とする
    const uid = createUid(activity)
    return activity.youtube && !hash[uid]
  })
  const updatings = activities.reduce((carry, activity) => {
    const uid = createUid(activity)
    const stored = storedHash[uid]
    // すでに store にある場合は上書きしつつ更新対象とする
    return stored ? [...carry, { ...stored, ...activity }] : carry
  }, [] as (Activity & { id: string })[]).map(upload)
  const insertings = activities.reduce((carry, activity) => {
    const uid = createUid(activity)
    const stored = storedHash[uid]
    // まだ store にない場合は追加対象とする
    return stored ? carry : [...carry, activity]
  }, [] as Activity[]).map(upload)

  await deletings
    .reduce((carry, { id }) => {
      const ref = firebase.firestore().collection('activities').doc(id)
      return carry.delete(ref)
    }, firebase.firestore().batch())
    .commit()
  await updatings
    .reduce((carry, { id, ...activity }) => {
      const ref = firebase.firestore().collection('activities').doc(id)
      return carry.update(ref, {
        ...activity,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      })
    }, firebase.firestore().batch())
    .commit()
  await insertings
    .reduce((carry, activity) => {
      const ref = firebase.firestore().collection('activities').doc()
      return carry.set(ref, {
        ...activity,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      })
    }, firebase.firestore().batch())
    .commit()

  console.log(
    red('%d activities deleted') +
      ', ' +
      yellow('%d activities updated') +
      ' and ' +
      cyan('%d activities inserted'),
    deletings.length,
    updatings.length,
    insertings.length
  )
}

const createUid = (activity: Activity) =>
  `${activity.ownerId}_${getTime(activity.startedAt)}`

export const fetchVideos = async (memberId?: string): Promise<void> => {
  console.log(green('fetching videos'))
  const members = listMembers()
  for (const member of members) {
    if (memberId && member.id !== memberId) {
      continue
    }
    console.log(green('fetching %s videos'), member.id)
    const videos = await fetch(member.youtube.channelId)
    const activities = videos
      .map((video) => convert(video, member))
      .sort((a, b) => (a.startedAt > b.startedAt ? 1 : -1)) // order by startedAt asc
    if (activities.length) {
      await updateActivities(activities, member.id)
    }
    console.log(green('fetched %s videos'), member.id)
  }
  console.log(green('fetched videos'))
}
