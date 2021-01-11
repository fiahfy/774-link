import { format, getMonth, getYear } from 'date-fns'
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'
import Twitter from 'twitter'

type Schedule = {
  date: Date
  events: Event[]
}

type Event = {
  ownerId: string
  title: string
  startedAt: Date
}

const Owner = {
  はねる: 'haneru-inaba',
  いちか: 'ichika-souya',
  らん: 'ran-hinokuma',
  くく: 'kuku-kazami',
  いづみ: 'izumi-yunohara',
  パトラ: 'patra-suou',
  シャル: 'charlotte-shimamura',
  ミコ: 'mico-sekishiro',
  メアリ: 'mary-saionji',
}

const parse = (text: string) => {
  // reg = /配信スケジュール.*\n([\s\S]*)#(あにまーれ|ハニスト)/
  // match = reg.exec(text)
  // if (!match) {
  //   return false
  // }
  // ;[, text] = match

  let matches: { date: Date; text?: string }[] = []
  let index = 0
  const reg = /((\d+)\/(\d+)[(（].[）)])/g
  for (;;) {
    const match = reg.exec(text)
    if (!match) {
      if (matches.length) {
        matches[matches.length - 1].text = text.slice(index)
      }
      break
    }

    if (matches.length) {
      matches[matches.length - 1].text = text.slice(index, match.index)
    }
    index = match.index

    const month = Number(match[2]) - 1
    const date = Number(match[3])

    const d = utcToZonedTime(new Date(), 'Asia/Tokyo')
    let year = getYear(d)
    if (getMonth(d) === 11 && month === 0) {
      year++ // increment year if it is December
    }

    // 0:00:00 UTC+9
    const startedAt = utcToZonedTime(new Date(year, month, date), 'Asia/Tokyo')

    matches = [...matches, { date: startedAt }]
  }

  if (!matches.length) {
    return []
  }

  return matches.reduce((carry, { date, text }) => {
    let events: Event[] = []
    // eslint-disable-next-line no-irregular-whitespace
    const reg = /([^\s　]+)[\s　]+(\d+):(\d+)-?(?:[\s　]*[(（](.+)[）)])?(?:\n(＊[^\n\s]+))?/g
    for (;;) {
      const match = reg.exec(text ?? '')
      if (!match) {
        break
      }

      const member = match[1]
      const hour = Number(match[2])
      const minute = Number(match[3])

      const ownerId = Owner[member as keyof typeof Owner] || ''
      let title = ''
      if (ownerId) {
        title = match[4] || ''
        if (title) {
          title += match[5] || ''
        }
      } else {
        title = member
      }
      const startedAt = new Date(date)
      startedAt.setHours(startedAt.getHours() + hour)
      startedAt.setMinutes(startedAt.getMinutes() + minute)

      events = [
        ...events,
        {
          match: match[0],
          ownerId,
          title,
          startedAt,
        },
      ]
    }

    if (!events.length) {
      return carry
    }

    return [
      ...carry,
      {
        text,
        date,
        events,
      },
    ]
  }, [] as Schedule[])
}

export const fetch = async (screenName: string): Promise<Schedule[]> => {
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY!,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET!,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY!,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
  })
  /* eslint-enable @typescript-eslint/no-non-null-assertion */
  const data = await client.get('statuses/user_timeline', {
    screen_name: screenName,
    tweet_mode: 'extended',
    count: 20,
  })
  const schedules = data
    .reverse()
    .map((timeline: any) => {
      const publishedAt = new Date(timeline.created_at)
      const schedules = parse(timeline.full_text)
      return schedules.map((schedule) => {
        return {
          ...schedule,
          events: schedule.events.map((event) => {
            return {
              ...event,
              publishedAt,
            }
          }),
        }
      })
    })
    .reduce(
      (carry: Schedule[], schedules: Schedule[]) => [...carry, ...schedules],
      []
    )
  return schedules
}
