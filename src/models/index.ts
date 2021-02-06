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
  id: string
  ownerId: string
  memberIds: string[]
  startedAt: Date
  sourceGroupId: string
  twitter: {
    timelineId: string
    text: string
  }
  youtube?: {
    videoId: string
    title: string
    description: string
  }
  createdAt: Date
  updatedAt: Date
}
