import {
  Avatar,
  Backdrop,
  Box,
  CircularProgress,
  Container,
  Typography,
  useTheme,
} from '@material-ui/core'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React from 'react'
import { findMember } from '~/data'
import firebaseAdmin from '~/firebase-admin'
import { Activity } from '~/models'

type Props = {
  activity: Activity
}

const Detail: NextPage<Props> = (props) => {
  const { activity } = props

  const router = useRouter()
  const theme = useTheme()

  if (router.isFallback) {
    return (
      <Backdrop open>
        <CircularProgress />
      </Backdrop>
    )
  }

  const member = findMember(activity.memberId)

  if (!member) {
    return null
  }

  return (
    <Container maxWidth="md">
      <Box alignItems="center" display="flex">
        <Avatar
          alt={member.name}
          style={{
            width: 64,
            height: 64,
            marginRight: theme.spacing(2),
          }}
        >
          <Image
            height={64}
            src={`/img/members/${member.id}_64x64@2x.png`}
            width={64}
          />
        </Avatar>
        <Typography>{member.nameJa}</Typography>
      </Box>
    </Container>
  )
}

export default Detail

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  const id = context.params?.id

  if (Array.isArray(id) || !id) {
    return {
      notFound: true,
    }
  }

  const doc = await firebaseAdmin
    .firestore()
    .collection('activities')
    .doc(id)
    .get()
  const data = doc.data()

  if (!data) {
    return {
      notFound: true,
    }
  }

  const activity = {
    ...data,
    id: doc.id,
    startedAt: data.startedAt.toDate(),
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  } as Activity

  return { props: { activity }, revalidate: 60 * 60 }
}
