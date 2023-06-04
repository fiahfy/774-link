import { CssBaseline, ThemeProvider } from '@material-ui/core'
import { NextPage } from 'next'
import { AppProps } from 'next/app'
import Head from 'next/head'
import React, { ReactElement, ReactNode } from 'react'
import theme from '~/theme'

// eslint-disable-next-line @typescript-eslint/ban-types
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

const MyApp = (props: AppPropsWithLayout) => {
  const { Component, pageProps } = props

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles)
    }
  }, [])

  const getLayout = Component.getLayout ?? ((page) => page)

  return (
    <React.Fragment>
      <Head>
        <title>774.link (β)</title>
        <meta
          content="minimum-scale=1, initial-scale=1, width=device-width"
          name="viewport"
        />
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {getLayout(<Component {...pageProps} />)}
      </ThemeProvider>
    </React.Fragment>
  )
}

export default MyApp
