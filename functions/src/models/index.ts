export type Schedule = {
  date: Date
  publishedAt: Date
  activities: Activity[]
}

export type Activity = {
  groupId: string
  ownerId: string
  title: string
  startedAt: Date
  source: string
}

export type Timeline = {
  createdAt: Date
  fullText: string
}

export type Member = {
  name: string
  nameJa: string
  groupId: string
  twitterScreenName: string
  youtubeChannelId: string
}
