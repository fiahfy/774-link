export type Group = {
  id: string
  name: string
  nameJa: string
  sourceable: boolean
  twitter: {
    name: string
    screenName: string
  }
}

export type Member = {
  id: string
  groupId: string
  name: string
  nameJa: string
  themeHue: number
  twitter: {
    screenName: string
  }
  youtube: {
    channelId: string
  }
}

export type Activity = {
  ownerId: string
  groupId: string
  startedAt: Date
  thumbnailUrl?: string
  twitter?: {
    timelineId: string
    text: string
    memberIds: string[]
    isHost: boolean
  }
  youtube?: {
    videoId: string
    title: string
    description: string
  }
}
