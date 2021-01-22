import { Backdrop, CircularProgress, Container } from '@material-ui/core'
import { addDays, isSameDay, startOfDay, subDays } from 'date-fns'
import { NextPage } from 'next'
import React from 'react'
import Schedule from '~/components/Schedule'
import firebase from '~/firebase'
import { Activity } from '~/models'

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
  const { loading, schedules } = useSchedules()

  useScrollToSelector('#primary-guideline')

  return (
    <>
      <Container maxWidth="md">
        {schedules.map((schedule, index) => (
          <Schedule
            activities={schedule.activities}
            date={schedule.date}
            key={index}
          />
        ))}
      </Container>
      <Backdrop open={loading}>
        <CircularProgress />
      </Backdrop>
    </>
  )
}

export default Index
