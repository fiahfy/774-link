import {
  AppBar,
  Backdrop,
  BottomNavigation,
  BottomNavigationAction,
  CircularProgress,
  Container,
  Toolbar,
  Typography,
  makeStyles,
  useTheme,
} from '@material-ui/core'
import { Schedule } from '@material-ui/icons'
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

const Layout: React.FC = (props) => {
  const { children } = props

  const classes = useStyles()
  const theme = useTheme()

  return (
    <div>
      <AppBar position="fixed">
        <Toolbar>
          <img
            height="44"
            src="/icon_transparent.png"
            style={{ marginRight: theme.spacing(1) }}
          />
          <Typography noWrap variant="h6">
            774.link (β)
          </Typography>
        </Toolbar>
      </AppBar>
      <main>
        <div className={classes.toolbarSpacer} />
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
