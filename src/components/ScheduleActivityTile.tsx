import { Avatar, Box, Typography, useTheme } from '@material-ui/core'
import { AvatarGroup } from '@material-ui/lab'
import Color from 'color'
import { addHours, isAfter, isBefore } from 'date-fns'
import Image from 'next/image'
import React from 'react'
import { findMember, listMembers } from '~/data'
import { useNow } from '~/hooks/useNow'
import { Activity } from '~/models'

const useLive = (date: Date) => {
  const now = useNow(60 * 1000)
  return React.useMemo(() => {
    return isAfter(now, date) && isBefore(now, addHours(date, 1))
  }, [date, now])
}

type Props = { summary: { startedAt: Date; activities: Activity[] } }

const ScheduleActivityTile: React.FC<Props> = (props) => {
  const { summary } = props

  const theme = useTheme()
  const live = useLive(summary.startedAt)

  const activity = summary.activities[0]
  if (!activity) {
    return null
  }

  const owner = findMember(activity.ownerId)
  if (!owner) {
    return null
  }

  const members = listMembers({ ids: activity.memberIds })

  return (
    <Box
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
        height: '100%',
        width: '100%',
      }}
    >
      <Box flexShrink={0} height={56} zIndex={1}>
        <AvatarGroup>
          {[owner, ...members].map((member) => (
            <Avatar
              alt={member.name}
              key={member.id}
              style={{
                backgroundColor: theme.palette.background.default,
                height: 56,
                width: 56,
              }}
            >
              <Image
                height={56}
                src={`/img/members/${member.id}_64x64@2x.png`}
                width={56}
              />
            </Avatar>
          ))}
        </AvatarGroup>
      </Box>
      <Box minWidth={0} ml={1}>
        <Typography noWrap variant="subtitle2">
          {owner.nameJa}
        </Typography>
        <Typography noWrap variant="body2">
          {activity.title || activity.description}
        </Typography>
      </Box>
    </Box>
  )
}

export default ScheduleActivityTile
