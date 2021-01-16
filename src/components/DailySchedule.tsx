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

const DailyScheduleActivity: React.FC = () => {
  return <div style={{ backgroundColor: '#ccc' }} />
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
    const grids = activities.reduce((carry, activity) => {
      const y = Math.floor(
        (getHours(activity.startedAt) * 60 + getMinutes(activity.startedAt)) /
          (60 / unitsPerHour)
      )
      const x =
        [...Array<number>(carry.length).keys()].find(
          (i) =>
            carry[i]
              ?.slice(y, y + unitsPerHour)
              .every((id) => id === undefined) ?? true
        ) ?? carry.length
      console.log(x, y, carry)
      if (x < carry.length) {
        return carry.map((lane, i) => {
          if (i !== x) {
            return lane
          }
          return lane.map((id, j) => (j >= y && j <= y + 4 ? activity.id : id))
        })
      } else {
        return [
          ...carry,
          Array(24 * unitsPerHour)
            .fill(undefined)
            .map((id, j) => (j >= y && j <= y + 4 ? activity.id : id)),
        ]
      }
    }, [] as (string | undefined)[][])
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

  const activityItems = useActivityItems(activities)

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
          <Box position="absolute" top={guidlineHeight * nowY} width="100%">
            <Guideline primary title={format(now, 'HH:mm')} />
          </Box>
        )}
        <Box
          height="100%"
          paddingLeft={`${titleWidth}px`}
          position="absolute"
          top={0}
          width="100%"
        >
          <DailyScheduleActivity />
        </Box>
      </Box>
    </Box>
  )
}

export default DailySchedule
