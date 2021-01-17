import React from 'react'
import { Box, Divider, makeStyles, Typography } from '@material-ui/core'
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
import { Activity } from '~/models'
import { calc } from '~/utils/calculator'

const titleWidth = 48
const guidlineHeight = 66

const useStyles = makeStyles((theme) => ({
  primaryDivider: {
    backgroundColor: theme.palette.primary.dark,
  },
}))

const Guideline: React.FC<{
  hideTitle?: boolean
  primary?: boolean
  title: string
}> = (props) => {
  const { hideTitle, primary, title } = props

  const classes = useStyles()

  return (
    <Box alignItems="center" display="flex" height={guidlineHeight}>
      <Box textAlign="center" width={titleWidth}>
        {!hideTitle && (
          <Typography
            color={primary ? 'primary' : 'textSecondary'}
            variant="body2"
          >
            {title}
          </Typography>
        )}
      </Box>
      <Box clone flexGrow={1}>
        <Divider className={primary ? classes.primaryDivider : undefined} />
      </Box>
    </Box>
  )
}

const DailyScheduleActivity: React.FC<{ activity: Activity }> = (props) => {
  const { activity } = props
  return (
    <Box
      alignItems="center"
      display="flex"
      justifyContent="space-around"
      px={1}
      style={{
        backgroundColor: '#ccc',
        border: '1px solid red',
        width: '100%',
        height: '100%',
      }}
    >
      <Box minWidth={0}>
        <Typography noWrap variant="subtitle2">
          {activity.memberId}
        </Typography>
        <Typography noWrap variant="body2">
          {activity.title}
        </Typography>
      </Box>
    </Box>
  )
}

const useNow = (interval: number) => {
  const [now, setNow] = React.useState(new Date())
  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, interval)
    return () => {
      clearInterval(timer)
    }
  }, [interval, now, setNow])
  return now
}

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
          y: (ys[i] * guidlineHeight) / unitsPerHour,
          h: guidlineHeight,
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

const DailySchedule: React.FC<Props> = (props) => {
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
            <Guideline
              hideTitle={hideTitle}
              key={hour}
              title={`${String(hour).padStart(2, '0')}:00`}
            />
          )
        })}
        {nowY !== undefined && (
          <Box
            id="primary-guideline"
            position="absolute"
            top={guidlineHeight * nowY}
            width="100%"
          >
            <Guideline primary title={format(now, 'HH:mm')} />
          </Box>
        )}
        <Box
          height="100%"
          pl={`${titleWidth}px`}
          position="absolute"
          pt={`${guidlineHeight / 2}px`}
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
                <DailyScheduleActivity activity={activity} />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default DailySchedule
