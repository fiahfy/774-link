import { Container } from '@material-ui/core'
import { addDays, isSameDay, startOfDay, subDays } from 'date-fns'
import { GetStaticProps, NextPage } from 'next'
import dynamic from 'next/dynamic'
import React from 'react'
import firebaseAdmin from '~/firebase-admin'
import { Activity } from '~/models'

const Schedule = dynamic(() => import('~/components/Schedule'), { ssr: false })

const useScrollToSelector = (selector: string) => {
  React.useEffect(() => {
    const timer = setInterval(() => {
      const e = document.querySelector(selector)
      if (!e) {
        return
      }
      clearInterval(timer)

      const rect = e.getBoundingClientRect()
      window.history.scrollRestoration = 'manual'
      window.scrollTo(
        0,
        rect.top + rect.height / 2 - window.innerHeight / 2 + window.scrollY
      )
    })
    return () => clearInterval(timer)
  }, [selector])
}

type Props = {
  activities: Activity[]
}

const Index: NextPage<Props> = (props) => {
  const { activities } = props

  useScrollToSelector('#primary-guideline')

  const startedAt = subDays(startOfDay(new Date()), 1)

  const schedules = activities.reduce(
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
  const startedAt = subDays(startOfDay(new Date()), 2)

  const snapshot = await firebaseAdmin
    .firestore()
    .collection('activities')
    .where('startedAt', '>', startedAt)
    .orderBy('startedAt', 'asc')
    .get()

  const activities = snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      ...data,
      id: doc.id,
      startedAt: data.startedAt.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Activity
  })

  return { props: { activities }, revalidate: 15 * 60 }
}
