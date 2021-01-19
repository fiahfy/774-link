import { Box, Typography, useTheme } from '@material-ui/core'
import Color from 'color'
import React from 'react'
import Image from '~/components/Image'
import { findMember } from '~/data'
import { Activity } from '~/models'

const ActivityTile: React.FC<{ activity: Activity }> = (props) => {
  const { activity } = props

  const theme = useTheme()

  const member = findMember(activity.memberId)
  if (!member) {
    return null
  }

  return (
    <Box
      display="flex"
      style={{
        backgroundColor: `${Color.hsl(member.themeHue, 33, 50).hex()}99`,
        border: `1px solid ${theme.palette.divider}`,
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
