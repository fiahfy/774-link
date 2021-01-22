export type Activity = {
  groupId: string
  memberId: string
  title: string
  description: string
  startedAt: Date
  timelineId: string
  videoId: string
}

export type Group = {
  id: string
  name: string
  nameJa: string
  screenName: string
}

export type Member = {
  id: string
  name: string
  nameJa: string
  groupId: string
  screenName: string
  channelId: string
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
