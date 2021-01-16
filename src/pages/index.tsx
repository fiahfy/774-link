import React from 'react'
import { NextPage } from 'next'
import {
  AppBar,
  Backdrop,
  BottomNavigation,
  BottomNavigationAction,
  CircularProgress,
  Container,
  makeStyles,
  Toolbar,
  Typography,
} from '@material-ui/core'
import { Schedule } from '@material-ui/icons'
import { addDays, isSameDay } from 'date-fns'
import firebase from '~/firebase'
import DailySchedule from '~/components/DailySchedule'
import { Event } from '~/models'

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
  const [loading, setLoading] = React.useState(true)
  const [schedules, setSchedules] = React.useState<
    { date: Date; events: Event[] }[]
  >([])
  React.useEffect(() => {
    ;(async () => {
      const schedules = [...Array<number>(3).keys()].reduce((carry, i) => {
        const date = addDays(new Date(), i)
        return [...carry, { date, events: [] }]
      }, [] as { date: Date; events: Event[] }[])

      const snapshot = await firebase
        .firestore()
        .collection('events')
        .where('startedAt', '>', new Date())
        .orderBy('startedAt', 'asc')
        .get()
      const events = snapshot.docs
        .map((doc) => {
          const data = doc.data()
          return {
            ...data,
            id: doc.id,
            startedAt: data.startedAt.toDate(),
          } as Event
        })
        .reduce((carry, event) => {
          return carry.map((schedule) => {
            if (!isSameDay(schedule.date, event.startedAt)) {
              return schedule
            }
            return {
              ...schedule,
              events: [...schedule.events, event],
            }
          })
        }, schedules)
      setSchedules(events)
      setLoading(false)
    })()
  }, [])
  return { loading, schedules }
}

const Index: NextPage = () => {
  const classes = useStyles()

  const { loading, schedules } = useSchedules()

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
            <DailySchedule date={schedule.date} events={schedule.events} key={index} />
          ))}
        </Container>
        <div className={classes.toolbarSpacer} />
      </main>
      <BottomNavigation className={classes.bottomNavigation} showLabels>
        <BottomNavigationAction icon={<Schedule />} label="Schedule" />
      </BottomNavigation>
      <Backdrop  open={loading}>
        <CircularProgress />
      </Backdrop>
    </div>
  )
}

export default Index
