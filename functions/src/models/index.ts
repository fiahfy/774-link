export type Activity = {
  groupId: string
  memberId: string
  title: string
  description: string
  startedAt: Date
  source: string
}

export type Group = {
  id: string
  name: string
  nameJa: string
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
  date: Date
  publishedAt: Date
  activities: Activity[]
}

export type Timeline = {
  fullText: string
  createdAt: Date
}
