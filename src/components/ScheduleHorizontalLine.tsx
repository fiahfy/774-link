import { Box, Divider, Typography, useTheme } from '@material-ui/core'
import React from 'react'

const labelWidth = 48
const tileHeight = 66

type Props = {
  hideTitle?: boolean
  label: string
  primary?: boolean
}

const ScheduleHorizontalLine: React.FC<Props> = (props) => {
  const { hideTitle, label, primary } = props

  const theme = useTheme()

  return (
    <Box alignItems="center" display="flex" height={tileHeight}>
      <Box textAlign="center" width={labelWidth}>
        {!hideTitle && (
          <Typography
            color={primary ? 'primary' : 'textSecondary'}
            variant="body2"
          >
            {label}
          </Typography>
        )}
      </Box>
      <Box clone flexGrow={1}>
        <Divider
          style={
            primary
              ? {
                  backgroundColor: theme.palette.primary.dark,
                  height: 1,
                }
              : undefined
          }
        />
      </Box>
    </Box>
  )
}

export default ScheduleHorizontalLine
