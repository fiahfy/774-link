import {
  Avatar,
  Backdrop,
  Box,
  CircularProgress,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  Typography,
  useTheme,
} from '@material-ui/core'
import { OpenInNew, Twitter, YouTube } from '@material-ui/icons'
import { format } from 'date-fns'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React from 'react'
import { findGroup, findMember, listMembers } from '~/data'
import firebaseAdmin from '~/firebase-admin'
import { Activity } from '~/models'

type Props = {
  activity: Activity
}

const Detail: NextPage<Props> = (props) => {
  const { activity } = props

  const theme = useTheme()
  const router = useRouter()

  if (router.isFallback) {
    return (
      <Backdrop open>
        <CircularProgress />
      </Backdrop>
    )
  }

  const owner = findMember(activity.ownerId)
  if (!owner) {
    return null
  }

  const members = listMembers({ ids: activity.memberIds })

  const group = findGroup(activity.sourceGroupId)
  if (!group) {
    return null
  }

  return (
    <Container disableGutters maxWidth="md">
      {/* <Image
        height="128"
        layout="responsive"
        src={`/img/members/${owner.id}_64x64@2x.png`}
        width="256"
      /> */}
      <Box m={2}>
        <Typography variant="h6">
          {activity.twitter.text || 'Untitled'}
        </Typography>
        <Typography color="textSecondary" variant="body2">
          {format(activity.startedAt, 'Pp')}
        </Typography>
      </Box>
      <List>
        <ListItem>
          <ListItemIcon>
            <Avatar alt={owner.name} style={{ height: 56, width: 56 }}>
              <Image
                height={56}
                src={`/img/members/${owner.id}_64x64@2x.png`}
                width={56}
              />
            </Avatar>
          </ListItemIcon>
          <ListItemText
            primary={owner.name}
            style={{ marginLeft: theme.spacing(2) }}
          />
        </ListItem>
      </List>
      {members.length > 0 && (
        <List subheader={<ListSubheader>Members</ListSubheader>}>
          {members.map((member) => (
            <ListItem key={member.id}>
              <ListItemIcon>
                <Avatar alt={member.name}>
                  <Image
                    height={40}
                    src={`/img/members/${member.id}_64x64@2x.png`}
                    width={40}
                  />
                </Avatar>
              </ListItemIcon>
              <ListItemText primary={member.name} />
            </ListItem>
          ))}
        </List>
      )}
      <List>
        <ListItem
          button
          component="a"
          href={`https://www.youtube.com/channel/${owner.youtube.channelId}/live`}
          target="_blank"
        >
          <ListItemIcon>
            <YouTube />
          </ListItemIcon>
          <ListItemText
            disableTypography
            primary={<Typography noWrap>Open Streamimg Page</Typography>}
          />
          <ListItemSecondaryAction>
            <OpenInNew />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem
          button
          component="a"
          href={`https://twitter.com/${group.twitter.screenName}/status/${activity.twitter.timelineId}`}
          target="_blank"
        >
          <ListItemIcon>
            <Twitter />
          </ListItemIcon>
          <ListItemText
            disableTypography
            primary={<Typography noWrap>Open Source Tweet</Typography>}
          />
          <ListItemSecondaryAction>
            <OpenInNew />
          </ListItemSecondaryAction>
        </ListItem>
      </List>
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

  return { props: { activity }, revalidate: 15 * 60 }
}
