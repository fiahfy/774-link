import { Box, Divider, makeStyles, Typography } from '@material-ui/core'
import React from 'react'

const labelWidth = 48
const tileHeight = 66

const useStyles = makeStyles((theme) => ({
  primaryDivider: {
    backgroundColor: theme.palette.primary.dark,
    height: 1,
  },
}))

type Props = {
  hideTitle?: boolean
  label: string
  primary?: boolean
}

const ScheduleHorizontalLine: React.FC<Props> = (props) => {
  const { hideTitle, label, primary } = props

  const classes = useStyles()

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
        <Divider className={primary ? classes.primaryDivider : undefined} />
      </Box>
    </Box>
  )
}

export default ScheduleHorizontalLine
