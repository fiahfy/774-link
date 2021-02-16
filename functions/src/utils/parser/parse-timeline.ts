import { addHours, addMinutes, getMonth, getYear } from 'date-fns'
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'
import { listMembers } from '../../data'
import { Activity, Member } from '../../models'

export type Timeline = {
  id: string
  fullText: string
  createdAt: Date
}
export type Schedule = {
  scheduledAt: Date
  publishedAt: Date
  activities: Activity[]
}

export const parseFullMessage = (message: string): string[] => {
  const messages: string[] = []

  const reg = /(\d+)\/(\d+)[(（].[）)]\s*\n/g
  let index = 0
  for (let i = 0; i < 10; i++) {
    const match = reg.exec(message)
    if (!match) {
      if (index > 0) {
        messages.push(message.slice(index))
      }
      break
    }

    if (index > 0) {
      messages.push(message.slice(index, match.index))
    }

    index = match.index
  }

  return messages
}

export const extractDate = (message: string): Date | undefined => {
  const reg = /(\d+)\/(\d+)[(（].[）)]/g
  const match = reg.exec(message)
  if (!match) {
    return undefined
  }

  const months = Number(match[1]) - 1
  const days = Number(match[2])

  // スケジュール日の月が現在の月よりも小さい場合は来年のスケジュール日と推定する
  const jst = utcToZonedTime(new Date(), 'Asia/Tokyo')
  let years = getYear(jst)
  if (months < getMonth(jst)) {
    years++
  }

  return zonedTimeToUtc(new Date(years, months, days), 'Asia/Tokyo')
}

export const parseMessage = (
  message: string,
  groupId: string
): Omit<Schedule, 'publishedAt'> | undefined => {
  // スケジュール日を取得
  const date = extractDate(message)
  // skip if date is not parsed
  if (!date) {
    return undefined
  }

  const allMembers = listMembers()
  const groupMembers = listMembers({ groupIds: [groupId] })

  // 時間を含んだテキストからアクティビティを取得
  const activities: Activity[] = []
  // eslint-disable-next-line no-irregular-whitespace
  const reg = /(\d+):(\d+)-?\s?([ぁ-んァ-ヶ/]+)(?:[\s　]*[(（](.+)[）)])?(?:\n?＊([^\n\s]+))?/g
  for (;;) {
    const match = reg.exec(message)
    if (!match) {
      break
    }

    const hours = Number(match[1])
    const minutes = Number(match[2])
    const memberName = match[3] ?? ''
    const description1 = match[4] ?? ''
    const description2 = match[5] ?? ''

    const startedAt = addMinutes(addHours(date, hours), minutes)
    let title = description1
    if (title && description2) {
      title += `(${description2})`
    }
    // 特定の文字列を含んでいなければ host の可能性がある
    const mayHost = !description2.includes('ch')

    // ひらがな、カタカナのまとまり毎にメンバーを抽出
    const m = `${memberName}/${description1}/${description2}`.match(
      /([ぁ-んー]+|[ァ-ヶー]+)/g
    )
    const members = (m ? Array.from(m) : [])
      .reduce((carry, name) => {
        // 抽出のノイズになりそうな文字列を除去
        const replaced = name.replace(/(さん|コラボ|メンバー)/g, '')
        // 除去した結果、2文字に満たない場合は無視
        if (replaced.length < 2) {
          return carry
        }
        // 名前から対象のメンバーを見つける
        // e.g. はねる -> 因幡はねる
        const member = allMembers.find((member) =>
          member.nameJa.match(replaced)
        )
        return member ? [...carry, member] : carry
      }, [] as Member[])
      .filter((member, index, array) => {
        // 重複を除去
        return array.findIndex((item) => member.id === item.id) === index
      })

    for (const [index, owner] of members.entries()) {
      const exists = groupMembers.some((member) => member.id === owner.id)
      if (!exists) {
        continue
      }

      const ownerId = owner.id
      const memberIds = members
        .filter((member) => member.id !== owner.id) // メンバーから自分自身を取り除く
        .map((member) => member.id)
      // 特定の文字列を含んでいない かつ 一番最初に見つかったメンバーは host 扱いとする
      const isHost = mayHost && index === 0

      activities.push({
        ownerId,
        groupId,
        startedAt,
        twitter: {
          timelineId: '',
          text: title,
          memberIds,
          isHost,
        },
      })
    }
  }

  // skip if activity is not found
  if (!activities.length) {
    return undefined
  }

  return {
    scheduledAt: date,
    activities,
  }
}

export const parseTimeline = (
  timeline: Timeline,
  groupId: string
): Schedule[] => {
  // ツイートの投稿日
  const publishedAt = new Date(timeline.createdAt)
  // ツイートを日別のスケジュール日単位のテキストに分割する
  const messages = parseFullMessage(timeline.fullText)
  return messages.reduce((carry, message) => {
    // ツイートからスケジュールを取得する
    const schedule = parseMessage(message, groupId)
    return schedule
      ? [
          ...carry,
          {
            ...schedule,
            // ソースの投稿日を設定
            publishedAt,
            // 各アクティビティにソース元の timeline id を設定
            activities: schedule.activities.map((activity) => ({
              ...activity,
              twitter: {
                ...activity.twitter,
                timelineId: timeline.id,
              } as Activity['twitter'],
            })),
          },
        ]
      : carry
  }, [] as Schedule[])
}
