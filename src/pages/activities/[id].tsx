import {
  Avatar,
  Backdrop,
  Box,
  CircularProgress,
  Container,
  Typography,
  useTheme,
} from '@material-ui/core'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import React from 'react'
import { findMember } from '~/data'
import firebase from '~/firebase'
import { useSrcSet } from '~/hooks/useSrcSet'
import { Activity } from '~/models'
import Error from '../_error'

const useActivity = (id: string | undefined) => {
  const [loading, setLoading] = React.useState(true)
  const [activity, setActivity] = React.useState<Activity>()
  React.useEffect(() => {
    ;(async () => {
      const doc = await firebase
        .firestore()
        .collection('activities')
        .doc(id)
        .get()
      const data = doc.data()
      if (data) {
        const activity = {
          ...data,
          id: doc.id,
          startedAt: data.startedAt.toDate(),
        } as Activity
        setActivity(activity)
      }
      setLoading(false)
    })()
  }, [id])
  return { loading, activity }
}

const Detail: NextPage = () => {
  const theme = useTheme()
  const router = useRouter()
  const srcSet = useSrcSet()

  let { id } = router.query
  id = Array.isArray(id) ? id[0] : id

  const { loading, activity } = useActivity(id)

  if (loading) {
    return (
      <Backdrop open={loading}>
        <CircularProgress />
      </Backdrop>
    )
  }

  if (!activity) {
    return <Error statusCode={404} />
  }

  const member = findMember(activity?.memberId)

  if (!member) {
    return <Error statusCode={500} />
  }

  return (
    <Container maxWidth="md">
      <Box alignItems="center" display="flex">
        <Avatar
          alt={member.nameJa}
          {...srcSet(`/img/members/${member.id}_64x64.png`)}
          style={{
            width: 64,
            height: 64,
            marginRight: theme.spacing(2),
          }}
        />
        <Typography>{member.nameJa}</Typography>
      </Box>
    </Container>
  )
}

export default Detail
