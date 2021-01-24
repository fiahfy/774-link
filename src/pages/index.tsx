import { Container } from '@material-ui/core'
import { addDays, isSameDay, startOfDay, subDays } from 'date-fns'
import { GetStaticProps, NextPage } from 'next'
import React from 'react'
import Schedule from '~/components/Schedule'
import firebaseAdmin from '~/firebase-admin'
import { Activity } from '~/models'

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

type Props = {
  schedules: { date: Date; activities: Activity[] }[]
}

const Index: NextPage<Props> = (props) => {
  const { schedules } = props

  useScrollToSelector('#primary-guideline')

  return (
    <Container maxWidth="md">
      {schedules.map((schedule, index) => (
        <Schedule
          activities={schedule.activities}
          date={schedule.date}
          key={index}
        />
      ))}
    </Container>
  )
}

export default Index

export const getStaticProps: GetStaticProps<Props> = async () => {
  const startedAt = subDays(startOfDay(new Date()), 1)

  const snapshot = await firebaseAdmin
    .firestore()
    .collection('activities')
    .where('startedAt', '>', startedAt)
    .orderBy('startedAt', 'asc')
    .get()

  const schedules = snapshot.docs
    .map((doc) => {
      const data = doc.data()
      return {
        ...data,
        id: doc.id,
        startedAt: data.startedAt.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Activity
    })
    .reduce(
      (carry, activity) => {
        return carry.map((schedule) => {
          if (!isSameDay(schedule.date, activity.startedAt)) {
            return schedule
          }
          return {
            ...schedule,
            activities: [...schedule.activities, activity],
          }
        })
      },
      [...Array<number>(3).keys()].reduce((carry, i) => {
        const date = addDays(startedAt, i)
        return [...carry, { date, activities: [] }]
      }, [] as { date: Date; activities: Activity[] }[])
    )

  return { props: { schedules }, revalidate: 15 * 60 }
}
