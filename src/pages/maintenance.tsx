import { Box, Typography } from '@material-ui/core'
import Head from 'next/head'
import React, { ReactElement } from 'react'
import Layout from '~/components/Layout'
import { NextPageWithLayout } from './_app'

const Maintenance: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Under Maintenance</title>
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
          <Typography variant="body1">Under Maintenance</Typography>
        </Box>
      </Box>
    </>
  )
}

Maintenance.getLayout = (page: ReactElement) => {
  return <Layout hideAppBar>{page}</Layout>
}

export default Maintenance
