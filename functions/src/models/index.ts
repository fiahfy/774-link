export type Activity = {
  memberId: string
  title: string
  description: string
  startedAt: Date
  sourceGroupId: string
  twitterTimelineId: string
  youtubeVideoId: string
}

export type Group = {
  id: string
  name: string
  nameJa: string
  sourceable: boolean
  twitterScreenName: string
}

export type Member = {
  id: string
  name: string
  nameJa: string
  groupId: string
  twitterScreenName: string
  youtubeChannelId: string
}

export type Schedule = {
  scheduledAt: Date
  publishedAt: Date
  activities: Activity[]
}

export type Timeline = {
  id: string
  fullText: string
  createdAt: Date
}
