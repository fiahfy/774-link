import { Box, Divider, Typography } from '@material-ui/core'
import Head from 'next/head'
import React from 'react'

const NotFound = (): JSX.Element => {
  return (
    <>
      <Head>
        <title>404: This page could not be found</title>
      </Head>
      <Box
        alignItems="center"
        bottom={0}
        display="flex"
        justifyContent="center"
        position="absolute"
        top={0}
        width="100%"
      >
        <Box alignItems="center" display="flex">
          <Typography variant="h6">404</Typography>
          <Box height={60} mx={2}>
            <Divider orientation="vertical" />
          </Box>
          <Typography variant="body1">This page could not be found</Typography>
        </Box>
      </Box>
    </>
  )
}

export default NotFound
