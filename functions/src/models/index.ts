export type Schedule = {
  date: Date
  publishedAt: Date
  events: Event[]
}

export type Event = {
  ownerId: string
  title: string
  startedAt: Date
}

export type Timeline = {
  createdAt: Date
  fullText: string
}
