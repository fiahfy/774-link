import { cyan, green, red, yellow } from 'chalk'
import { format, getTime } from 'date-fns'
import fetch from 'node-fetch'
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

const fetchVideos = async (member: Member): Promise<Video[]> => {
  const results = await youtubeClient.search.list({
    part: ['id'],
    channelId: member.youtube.channelId,
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
              thumbnailUrl:
                item.snippet?.thumbnails?.standard?.url ?? undefined,
            },
          ]
        : carry
    }, [] as Video[]) ?? []
  )
}

const convertVideos = (videos: Video[], member: Member) => {
  return videos
    .map((video) => ({
      ownerId: member.id,
      groupId: member.groupId,
      startedAt: video.startedAt,
      thumbnailUrl: video.thumbnailUrl,
      youtube: {
        videoId: video.id,
        title: video.title,
        description: video.description,
      },
    }))
    .sort((a, b) => (a.startedAt > b.startedAt ? 1 : -1)) // order by startedAt asc
}

const createUid = (activity: Activity) =>
  `${activity.ownerId}_${getTime(activity.startedAt)}`

const updateActivities = async (activities: Activity[], member: Member) => {
  console.log('updating activities for %s', member.id)

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
    .where('ownerId', '==', member.id)
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
  }, [] as (Activity & { id: string })[])
  const insertings = activities.reduce((carry, activity) => {
    const uid = createUid(activity)
    const stored = storedHash[uid]
    // まだ store にない場合は追加対象とする
    return stored ? carry : [...carry, activity]
  }, [] as Activity[])

  await deletings
    .reduce((carry, { id }) => {
      const ref = firebase.firestore().collection('activities').doc(id)
      return carry.delete(ref)
    }, firebase.firestore().batch())
    .commit()
  const [updatingBatch, updatingUrls] = updatings.reduce(
    ([batch, urls], { id, ...activity }) => {
      const thumbnailUrl = activity.thumbnailUrl
      delete activity.thumbnailUrl
      const ref = firebase.firestore().collection('activities').doc(id)
      batch.update(ref, {
        ...activity,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      })
      return [batch, [...urls, { id, thumbnailUrl }]]
    },
    [
      firebase.firestore().batch(),
      [] as { id: string; thumbnailUrl: string | undefined }[],
    ]
  )
  await updatingBatch.commit()
  const [insertingBatch, insertingUrls] = insertings.reduce(
    ([batch, urls], activity) => {
      const thumbnailUrl = activity.thumbnailUrl
      delete activity.thumbnailUrl
      const ref = firebase.firestore().collection('activities').doc()
      batch.set(ref, {
        ...activity,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      })
      return [batch, [...urls, { id: ref.id, thumbnailUrl }]]
    },
    [
      firebase.firestore().batch(),
      [] as { id: string; thumbnailUrl: string | undefined }[],
    ]
  )
  await insertingBatch.commit()

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

  return [...updatingUrls, ...insertingUrls]
}

const uploadThumbnails = async (
  urls: { id: string; thumbnailUrl: string | undefined }[]
) => {
  console.log('uploading thumbnails')

  const updatings = await urls.reduce(async (carry, { id, thumbnailUrl }) => {
    if (!thumbnailUrl) {
      return carry
    }

    try {
      const res = await fetch(thumbnailUrl)
      const buffer = await res.buffer()
      const file = firebase.storage().bucket().file(`activities/${id}`)
      await file.save(buffer, {
        contentType: 'image/jpeg',
        gzip: true,
        public: true,
      })
      const [metadata] = await file.getMetadata()
      const publicUrl = (metadata.mediaLink as string).replace(
        /^(https:\/\/storage.googleapis.com\/)download\/storage\/v1\/b\/([^/]+\/)o\/([^?]+).*$/,
        (_, p1, p2, p3) => {
          return `${p1}${p2}${p3}`
        }
      )
      return [...(await carry), { id, thumbnailUrl: publicUrl }]
    } catch (e) {
      console.error(e)
      return carry
    }
  }, Promise.resolve([] as { id: string; thumbnailUrl: string }[]))

  await updatings
    .reduce((carry, { id, thumbnailUrl }) => {
      const ref = firebase.firestore().collection('activities').doc(id)
      return carry.update(ref, {
        thumbnailUrl,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      })
    }, firebase.firestore().batch())
    .commit()

  console.log(yellow('%d thumbnails uploaded'), updatings.length)
}

export const updateActivitiesWithVideos = async (
  memberId?: string
): Promise<void> => {
  console.log(green('updating activities'))

  const members = listMembers()
  for (const member of members) {
    if (memberId && member.id !== memberId) {
      continue
    }

    console.log(green('updating %s activities'), member.id)
    const videos = await fetchVideos(member)
    const activities = convertVideos(videos, member)
    if (activities.length) {
      const urls = await updateActivities(activities, member)
      await uploadThumbnails(urls)
    }
    console.log(green('updated %s activities'), member.id)
  }

  console.log(green('updated activities'))
}
