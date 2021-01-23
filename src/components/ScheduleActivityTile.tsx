import { Box, Typography } from '@material-ui/core'
import Color from 'color'
import { addHours, isAfter, isBefore } from 'date-fns'
import React from 'react'
import { findMember } from '~/data'
import { useNow } from '~/hooks/useNow'
import { useSrcSet } from '~/hooks/useSrcSet'
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

type Props = { activity: Activity; onClick?: () => void }

const ScheduleActivityTile: React.FC<Props> = (props) => {
  const { activity, onClick } = props

  const srcSet = useSrcSet()
  const live = useLive(activity)

  const member = findMember(activity.memberId)
  if (!member) {
    return null
  }

  return (
    <Box
      display="flex"
      onClick={onClick}
      style={{
        backgroundColor: `${Color.hsl(
          member.themeHue,
          33,
          live ? 50 : 33
        ).hex()}`,
        cursor: onClick && 'pointer',
        height: '100%',
        width: '100%',
      }}
    >
      <Box
        alignItems="center"
        display="flex"
        flexGrow={1}
        justifyContent="center"
        minWidth={0}
        overflow="hidden"
        px={1}
        zIndex={1}
      >
        <img
          {...srcSet(`/img/members/${member.id}_64x64.png`)}
          style={{ height: '100%' }}
        />
        <Box minWidth={0} ml={1}>
          <Typography noWrap variant="subtitle2">
            {member.nameJa}
          </Typography>
          <Typography noWrap variant="body2">
            {activity.title || activity.description}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default ScheduleActivityTile
