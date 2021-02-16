import { Box, Typography } from '@material-ui/core'
import React from 'react'
import {
  addDays,
  addMinutes,
  format,
  getHours,
  getMinutes,
  isAfter,
  isBefore,
  isEqual,
  setHours,
  startOfDay,
  subMinutes,
} from 'date-fns'
import Link from '~/components/Link'
import ScheduleActivityTile from '~/components/ScheduleActivityTile'
import ScheduleHorizontalLine from '~/components/ScheduleHorizontalLine'
import { useNow } from '~/hooks/useNow'
import { Activity } from '~/models'
import { calc } from '~/utils/calculator'

const labelWidth = 48
const tileHeight = 64

const useSummaries = (activities: Activity[]) => {
  return React.useMemo(() => {
    const { summaries } = activities.reduce(
      ({ summaries, picked }, activity, _index, array) => {
        // ピック済みだったら skip する
        if (picked.includes(activity.id)) {
          return { summaries, picked }
        }
        const startedAt = activity.startedAt
        // 同じ開始時間 かつ お互いに memberId を所有している activity を取得
        const activities = array.filter(
          (item) =>
            item.id !== activity.id &&
            isEqual(item.startedAt, activity.startedAt) &&
            (item.twitter?.memberIds ?? []).includes(activity.ownerId)
        )
        // 一番 memberIds が多くなければ skip
        const largest = activities.every(
          (a) =>
            (activity.twitter?.memberIds ?? []).length >=
            (a.twitter?.memberIds ?? []).length
        )
        if (!largest) {
          return { summaries, picked }
        }
        // 一番 memberIds が多い activity の中に host があれば skip
        const host = !activities.some(
          (a) =>
            (activity.twitter?.memberIds ?? []).length <=
              (a.twitter?.memberIds ?? []).length && a.twitter?.isHost
        )
        if (!host) {
          return { summaries, picked }
        }
        return {
          summaries: [
            ...summaries,
            {
              startedAt,
              activities: [activity, ...activities],
            },
          ],
          // 同じ開始時間の activity はピック済みに追加する
          picked: [...picked, ...activities.map((activity) => activity.id)],
        }
      },
      { summaries: [], picked: [] } as {
        summaries: { startedAt: Date; activities: Activity[] }[]
        picked: string[]
      }
    )
    return summaries
  }, [activities])
}

const useCalculatePosition = (
  summaries: { startedAt: Date; activities: Activity[] }[]
) => {
  const unitsPerHour = 4
  return React.useMemo(() => {
    // summaries を開始時間に応じて y 軸の値に変換
    const ys = summaries.map((summary) => {
      return Math.floor(
        (getHours(summary.startedAt) * 60 + getMinutes(summary.startedAt)) /
          (60 / unitsPerHour)
      )
    }, [] as number[])
    // y 軸の値から x 軸の値と width を取得
    const data = calc(ys, unitsPerHour, 24 * unitsPerHour)
    // summaries に位置情報を付与する
    return summaries.map((summary, i) => {
      const { x, w } = data[i]
      return {
        rect: {
          x,
          w,
          y: (ys[i] * tileHeight) / unitsPerHour,
          h: tileHeight,
        },
        summary,
      }
    })
  }, [summaries])
}

type Props = {
  date: Date
  activities: Activity[]
}

const Schedule: React.FC<Props> = (props) => {
  const { date: initialDate, activities } = props

  const date = startOfDay(initialDate)

  const now = useNow(1000)

  const nowY = React.useMemo(() => {
    const nextDate = addDays(date, 1)
    if (!isAfter(now, date) || !isBefore(now, nextDate)) {
      return undefined
    }
    return getHours(now) + getMinutes(now) / 60
  }, [date, now])

  const closeToNow = React.useCallback(
    (date: Date) => {
      return (
        isAfter(now, subMinutes(date, 15)) &&
        isBefore(now, addMinutes(date, 15))
      )
    },
    [now]
  )

  const summaries = useSummaries(activities)
  const items = useCalculatePosition(summaries)

  return (
    <Box my={3}>
      <Typography gutterBottom noWrap variant="subtitle1">
        {format(date, 'PPPP')}
      </Typography>
      <Box position="relative">
        {[...Array<number>(25).keys()].map((hour) => {
          const d = setHours(date, hour)
          const hideTitle = closeToNow(d)
          return (
            <ScheduleHorizontalLine
              hideTitle={hideTitle}
              key={hour}
              label={`${String(hour).padStart(2, '0')}:00`}
            />
          )
        })}
        {nowY !== undefined && (
          <Box
            id="primary-guideline"
            position="absolute"
            style={{ pointerEvents: 'none' }}
            top={tileHeight * nowY}
            width="100%"
            zIndex={1}
          >
            <ScheduleHorizontalLine label={format(now, 'HH:mm')} primary />
          </Box>
        )}
        <Box
          height="100%"
          pl={`${labelWidth}px`}
          position="absolute"
          pt={`${tileHeight / 2}px`}
          top={0}
          width="100%"
        >
          <Box position="relative">
            {items.map(({ rect, summary }, index) => (
              <Box
                height={rect.h}
                key={index}
                left={`${rect.x * 100}%`}
                position="absolute"
                top={rect.y}
                width={`${rect.w * 100}%`}
              >
                <Link
                  as={`/activities/${summary.activities[0].id}`}
                  href="/activities/[id]"
                  style={{
                    color: 'inherit',
                    textDecoration: 'inherit',
                  }}
                >
                  <ScheduleActivityTile summary={summary} />
                </Link>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Schedule
