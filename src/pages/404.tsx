import { Box, Divider, Typography } from '@material-ui/core'
import Head from 'next/head'
import React, { ReactElement } from 'react'
import Layout from '~/components/Layout'
import { NextPageWithLayout } from './_app'

const NotFound: NextPageWithLayout = () => {
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

NotFound.getLayout = (page: ReactElement) => {
  return <Layout hideAppBar>{page}</Layout>
}

export default NotFound
