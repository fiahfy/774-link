import { AppBar, Box, Toolbar, Typography, makeStyles } from '@material-ui/core'
import Image from 'next/image'
import React from 'react'

const useStyles = makeStyles((theme) => ({
  //   root: {
  //     // display: 'flex',
  //     // flexDirection: 'column',
  //     // minHeight: '100vh',
  //   },
  //   icon: {
  //     marginRight: theme.spacing(1),
  //   },
  toolbarSpacer: theme.mixins.toolbar,
  //   content: {
  //     // flexGrow: 1,
  //     // // height: '100vh',
  //     // overflow: 'auto',
  //   },
  //   container: {},
  //   bottomNavigation: {
  //     position: 'fixed',
  //     bottom: 0,
  //     width: '100%',
  //   },
}))

type Props = {
  hideAppBar?: boolean
}

const Layout: React.FC<Props> = (props) => {
  const { children, hideAppBar = false } = props

  const classes = useStyles()
  // const theme = useTheme()

  return (
    <div>
      {!hideAppBar && (
        <AppBar position="fixed">
          <Toolbar>
            <Box mr={1}>
              <Image height="44" src="/icon_transparent.png" width="44" />
            </Box>
            <Typography noWrap variant="h6">
              774.link (β)
            </Typography>
          </Toolbar>
        </AppBar>
      )}
      <main>
        {!hideAppBar && <div className={classes.toolbarSpacer} />}
        {children}
        {/* <div className={classes.toolbarSpacer} /> */}
      </main>
      {/* <BottomNavigation className={classes.bottomNavigation} showLabels>
        <BottomNavigationAction icon={<Schedule />} label="Schedule" />
      </BottomNavigation> */}
    </div>
  )
}

export default Layout
