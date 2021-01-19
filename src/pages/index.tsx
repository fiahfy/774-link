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
} from '@material-ui/core'
import { Schedule } from '@material-ui/icons'
import { addDays, isSameDay, startOfDay, subDays } from 'date-fns'
import { NextPage } from 'next'
import React from 'react'
import DailySchedule from '~/components/DailySchedule'
import firebase from '~/firebase'
import { Activity } from '~/models'

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
    { date: Date; activities: Activity[] }[]
  >([])
  React.useEffect(() => {
    ;(async () => {
      const startedAt = subDays(startOfDay(new Date()), 1)

      const schedules = [...Array<number>(3).keys()].reduce((carry, i) => {
        const date = addDays(startedAt, i)
        return [...carry, { date, activities: [] }]
      }, [] as { date: Date; activities: Activity[] }[])

      const snapshot = await firebase
        .firestore()
        .collection('activities')
        .where('startedAt', '>', startedAt)
        .orderBy('startedAt', 'asc')
        .get()
      const activities = snapshot.docs
        .map((doc) => {
          const data = doc.data()
          return {
            ...data,
            id: doc.id,
            startedAt: data.startedAt.toDate(),
          } as Activity
        })
        .reduce((carry, activity) => {
          return carry.map((schedule) => {
            if (!isSameDay(schedule.date, activity.startedAt)) {
              return schedule
            }
            return {
              ...schedule,
              activities: [...schedule.activities, activity],
            }
          })
        }, schedules)

      setSchedules(activities)
      setLoading(false)
    })()
  }, [])
  return { loading, schedules }
}

const useScrollToSelector = (selector: string) => {
  React.useEffect(() => {
    const timer = setInterval(() => {
      const e = document.querySelector(selector)
      if (!e) {
        return
      }
      clearInterval(timer)

      const rect = e.getBoundingClientRect()
      window.scrollTo(0, rect.top + rect.height / 2 - window.innerHeight / 2)
    })
    return () => clearInterval(timer)
  }, [selector])
}

const Index: NextPage = () => {
  const classes = useStyles()

  const { loading, schedules } = useSchedules()

  useScrollToSelector('#primary-guideline')

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
            <DailySchedule
              activities={schedule.activities}
              date={schedule.date}
              key={index}
            />
          ))}
        </Container>
        {/* <div className={classes.toolbarSpacer} /> */}
      </main>
      {/* <BottomNavigation className={classes.bottomNavigation} showLabels>
        <BottomNavigationAction icon={<Schedule />} label="Schedule" />
      </BottomNavigation> */}
      <Backdrop open={loading}>
        <CircularProgress />
      </Backdrop>
    </div>
  )
}

export default Index
