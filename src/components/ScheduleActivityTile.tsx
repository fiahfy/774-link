import { Box, Typography } from '@material-ui/core'
import Color from 'color'
import React from 'react'
import Image from '~/components/Image'
import { findMember } from '~/data'
import { Activity } from '~/models'

type Props = { activity: Activity; onClick?: () => void }

const ActivityTile: React.FC<Props> = (props) => {
  const { activity, onClick } = props

  const member = findMember(activity.memberId)
  if (!member) {
    return null
  }

  return (
    <Box
      display="flex"
      onClick={onClick}
      style={{
        backgroundColor: `${Color.hsl(member.themeHue, 33, 50).hex()}99`,
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
        <Image
          src={`/img/members/${member.id}_64x64.png`}
          style={{ height: '100%' }}
        />
        <Box minWidth={0} ml={1}>
          <Typography noWrap variant="subtitle2">
            {member.nameJa}
          </Typography>
          <Typography noWrap variant="body2">
            {activity.title}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default ActivityTile
