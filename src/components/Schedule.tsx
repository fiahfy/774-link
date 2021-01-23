import { Box, Typography } from '@material-ui/core'
import { useRouter } from 'next/router'
import React from 'react'
import {
  addDays,
  addMinutes,
  format,
  getHours,
  getMinutes,
  isAfter,
  isBefore,
  setHours,
  startOfDay,
  subMinutes,
} from 'date-fns'
import ScheduleActivityTile from '~/components/ScheduleActivityTile'
import ScheduleHorizontalLine from '~/components/ScheduleHorizontalLine'
import { useNow } from '~/hooks/useNow'
import { Activity } from '~/models'
import { calc } from '~/utils/calculator'

const labelWidth = 48
const tileHeight = 64

const useActivityItems = (activities: Activity[]) => {
  const unitsPerHour = 4
  return React.useMemo(() => {
    const ys = activities.map((activity) => {
      return (
        (getHours(activity.startedAt) * 60 + getMinutes(activity.startedAt)) /
        (60 / unitsPerHour)
      )
    }, [] as number[])
    const data = calc(ys, unitsPerHour, 24 * unitsPerHour)
    return activities.map((activity, i) => {
      const { x, w } = data[i]
      return {
        rect: {
          x,
          w,
          y: (ys[i] * tileHeight) / unitsPerHour,
          h: tileHeight,
        },
        activity,
      }
    })
  }, [activities])
}

type Props = {
  date: Date
  activities: Activity[]
}

const Schedule: React.FC<Props> = (props) => {
  const { date: initialDate, activities } = props

  const date = startOfDay(initialDate)

  const router = useRouter()
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

  const items = useActivityItems(activities)

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
            {items.map(({ rect, activity }, index) => (
              <Box
                height={rect.h}
                key={index}
                left={`${rect.x * 100}%`}
                position="absolute"
                top={rect.y}
                width={`${rect.w * 100}%`}
              >
                <ScheduleActivityTile
                  activity={activity}
                  onClick={() => {
                    router.push(`/activities/${activity.id}`)
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Schedule
