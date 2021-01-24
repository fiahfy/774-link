import { Box, Typography } from '@material-ui/core'
import Color from 'color'
import { addHours, isAfter, isBefore } from 'date-fns'
import Image from 'next/image'
import React from 'react'
import Link from '~/components/Link'
import { findMember } from '~/data'
import { useNow } from '~/hooks/useNow'
import { Activity } from '~/models'

const useLive = (acitvity: Activity) => {
  const now = useNow(60 * 1000)
  return React.useMemo(() => {
    return (
      isAfter(now, acitvity.startedAt) &&
      isBefore(now, addHours(acitvity.startedAt, 1))
    )
  }, [acitvity.startedAt, now])
}

type Props = { activity: Activity; href: string }

const ScheduleActivityTile: React.FC<Props> = (props) => {
  const { activity, href } = props

  const live = useLive(activity)

  const member = findMember(activity.memberId)
  if (!member) {
    return null
  }

  return (
    <Link
      href={href}
      style={{
        color: 'inherit',
        textDecoration: 'inherit',
      }}
    >
      <Box
        alignItems="center"
        display="flex"
        justifyContent="center"
        overflow="hidden"
        px={1}
        style={{
          backgroundColor: `${Color.hsl(
            member.themeHue,
            33,
            live ? 50 : 33
          ).hex()}`,
          height: '100%',
          width: '100%',
        }}
      >
        <Box flexShrink={0} height={64} width={64} zIndex={1}>
          <Image
            alt={member.name}
            height={64}
            layout="intrinsic"
            src={`/img/members/${member.id}_64x64@2x.png`}
            width={64}
          />
        </Box>
        <Box minWidth={0} ml={1}>
          <Typography noWrap variant="subtitle2">
            {member.nameJa}
          </Typography>
          <Typography noWrap variant="body2">
            {activity.title || activity.description}
          </Typography>
        </Box>
      </Box>
    </Link>
  )
}

export default ScheduleActivityTile
