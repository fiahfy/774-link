import React from 'react'
import { NextPage } from 'next'
import {
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Container,
  makeStyles,
  Toolbar,
  Typography,
} from '@material-ui/core'
import { Schedule } from '@material-ui/icons'
import DailySchedule from '~/components/DailySchedule'
import { addDays } from 'date-fns'

const useStyles = makeStyles((theme) => ({
  root: {
    // display: 'flex',
    // flexDirection: 'column',
    // minHeight: '100vh',
  },
  icon: {
    marginRight: theme.spacing(1),
  },
  toolbarSpacer: theme.mixins.toolbar,
  content: {
    // flexGrow: 1,
    // // height: '100vh',
    // overflow: 'auto',
  },
  container: {},
  bottomNavigation: {
    position: 'fixed',
    bottom: 0,
    width: '100%',
  },
}))

const useSchedules = () => {
  return [...Array<number>(3).keys()].reduce((carry, i) => {
    const date = addDays(new Date(), i)
    return [...carry, { date }]
  }, [] as { date: Date }[])
}

const Index: NextPage = () => {
  const classes = useStyles()

  const schedules = useSchedules()

  return (
    <div className={classes.root}>
      <AppBar position="fixed">
        <Toolbar>
          <img
            className={classes.icon}
            height="44"
            src="/icon_transparent.png"
          />
          <Typography noWrap variant="h6">
            774.link
          </Typography>
        </Toolbar>
      </AppBar>
      <main className={classes.content}>
        <div className={classes.toolbarSpacer} />
        <Container className={classes.container} maxWidth="md">
          {schedules.map((schedule, index) => (
            <DailySchedule date={schedule.date} key={index} />
          ))}
        </Container>
        <div className={classes.toolbarSpacer} />
      </main>
      <BottomNavigation className={classes.bottomNavigation} showLabels>
        <BottomNavigationAction icon={<Schedule />} label="Schedule" />
      </BottomNavigation>
    </div>
  )
}

export default Index
