import React from 'react'
import Box from '@material-ui/core/Box'
import CircularProgress from '@material-ui/core/CircularProgress'

const Loader: React.FC = () => {
  return (
    <Box alignItems="center" display="flex" flexDirection="column" mt={8}>
      <CircularProgress />
    </Box>
  )
}

export default Loader
