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
      <Box mr={1} textAlign="right" width={40}>
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

type Props = {
  date: Date
}

const DailySchedule: React.FC<Props> = (props) => {
  const { date: initialDate } = props

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
      </Box>
    </Box>
  )
}

export default DailySchedule
