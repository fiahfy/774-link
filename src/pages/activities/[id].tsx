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
} from '@material-ui/core'
import { OpenInNew, Twitter } from '@material-ui/icons'
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
        <Typography variant="h6">{activity.twitter.text}</Typography>
        <Typography color="textSecondary" variant="body2">
          {format(activity.startedAt, 'Pp')}
        </Typography>
      </Box>
      <List>
        <ListItem>
          <ListItemIcon>
            <Avatar alt={owner.name}>
              <Image
                height={40}
                src={`/img/members/${owner.id}_64x64@2x.png`}
                width={40}
              />
            </Avatar>
          </ListItemIcon>
          <ListItemText primary={owner.nameJa} />
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
              <ListItemText primary={member.nameJa} />
            </ListItem>
          ))}
        </List>
      )}
      <List subheader={<ListSubheader>Source</ListSubheader>}>
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
            primary={<Typography noWrap>{group.twitter.name}</Typography>}
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

  return { props: { activity }, revalidate: 60 * 60 }
}
