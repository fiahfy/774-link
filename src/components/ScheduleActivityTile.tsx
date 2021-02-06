import { Avatar, Box, Typography, useTheme } from '@material-ui/core'
import Color from 'color'
import { addHours, isAfter, isBefore } from 'date-fns'
import Image from 'next/image'
import React from 'react'
import { findMember, listMembers } from '~/data'
import { useNow } from '~/hooks/useNow'
import { Activity } from '~/models'

const avatarSize = 56

const useLive = (date: Date) => {
  const now = useNow(60 * 1000)
  return React.useMemo(() => {
    return isAfter(now, date) && isBefore(now, addHours(date, 1))
  }, [date, now])
}

const useResizeObserver = (
  target: React.RefObject<HTMLElement | undefined>,
  callback: ResizeObserverCallback
) => {
  React.useEffect(() => {
    if (!target.current) {
      return
    }
    const observer = new ResizeObserver(callback)
    observer.observe(target.current)
    return () => {
      observer.disconnect()
    }
  }, [callback, target])
}

type Props = { summary: { startedAt: Date; activities: Activity[] } }

const ScheduleActivityTile: React.FC<Props> = (props) => {
  const { summary } = props

  const theme = useTheme()
  const live = useLive(summary.startedAt)
  const [maxAvatars, setMaxAvatars] = React.useState(1)
  const ref = React.useRef<HTMLDivElement>()
  const callback = React.useCallback((entries: ResizeObserverEntry[]) => {
    const maxAvatars = Math.floor(entries[0].contentRect.width / avatarSize)
    setMaxAvatars(Math.max(1, maxAvatars))
  }, [])
  useResizeObserver(ref, callback)

  const activity = summary.activities[0]
  if (!activity) {
    return null
  }

  const owner = findMember(activity.ownerId)
  if (!owner) {
    return null
  }

  const members = listMembers({ ids: activity.memberIds })
  const others = 1 + members.length - maxAvatars
  const avatars = Math.max(1, others > 0 ? maxAvatars - 1 : members.length + 1)
  const hasOthers = others > 0 && maxAvatars !== 1

  return (
    <Box
      // @see https://github.com/mui-org/material-ui/issues/17010
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...({ ref } as any)}
      alignItems="center"
      display="flex"
      justifyContent="center"
      overflow="hidden"
      px={1}
      style={{
        backgroundColor: `${Color.hsl(
          owner.themeHue,
          33,
          live ? 50 : 33
        ).hex()}`,
        boxSizing: 'border-box',
        borderColor: theme.palette.background.default,
        borderStyle: 'solid',
        borderWidth: 0.5,
        height: '100%',
        width: '100%',
      }}
    >
      <Box display="flex" flexShrink={0} height={avatarSize} zIndex={1}>
        {[owner, ...members].slice(0, avatars).map((member, i) => (
          <Avatar
            alt={member.name}
            key={member.id}
            style={{
              borderColor: theme.palette.background.default,
              borderStyle: 'solid',
              borderWidth: 2,
              backgroundColor: theme.palette.background.default,
              height: avatarSize,
              marginLeft: i > 0 ? -1 * theme.spacing(1) : 0,
              width: avatarSize,
              zIndex: -i,
            }}
          >
            <Image
              height={avatarSize}
              src={`/img/members/${member.id}_64x64@2x.png`}
              width={avatarSize}
            />
          </Avatar>
        ))}
        {hasOthers && (
          <Avatar
            style={{
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.secondary,
              height: avatarSize,
              marginLeft: -1 * theme.spacing(1),
              width: avatarSize,
            }}
          >
            +{others + 1}
          </Avatar>
        )}
      </Box>
      <Box minWidth={0} ml={1} zIndex={1}>
        <Typography noWrap variant="subtitle2">
          {owner.nameJa}
        </Typography>
        <Typography noWrap variant="body2">
          {activity.twitter.text}
        </Typography>
      </Box>
    </Box>
  )
}

export default ScheduleActivityTile
