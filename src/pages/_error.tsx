import { Box, Divider, Typography } from '@material-ui/core'
import { ErrorProps } from 'next/error'
import Head from 'next/head'
import React from 'react'

const statusCodes: { [code: number]: string } = {
  400: 'Bad Request',
  404: 'This page could not be found',
  405: 'Method Not Allowed',
  500: 'Internal Server Error',
}

const Error: React.FC<ErrorProps> = (props) => {
  const { statusCode, title } = props

  const message =
    title || statusCodes[statusCode] || 'An unexpected error has occurred'

  return (
    <>
      <Head>
        <title>
          {statusCode}: {message}
        </title>
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
          <Typography variant="h6">{statusCode}</Typography>
          <Box height={60} mx={2}>
            <Divider orientation="vertical" />
          </Box>
          <Typography variant="body1">{message}</Typography>
        </Box>
      </Box>
    </>
  )
}

export default Error
