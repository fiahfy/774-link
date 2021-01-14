export type Schedule = {
  date: Date
  publishedAt: Date
  events: Event[]
}

export type Event = {
  groupId: string
  ownerId: string
  title: string
  startedAt: Date
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
