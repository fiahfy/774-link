import firebase from 'firebase'
import { Event } from '../models'

const db = firebase.firestore()

export const list = async ({ group, started_at_gte, started_at_lt }) => {
  let ref = db.collection('events')
  if (group) {
    ref = ref.where('group', '==', db.collection('groups').doc(group))
  }
  if (started_at_gte) {
    ref = ref.where('started_at', '>=', started_at_gte)
  }
  if (started_at_lt) {
    ref = ref.where('started_at', '<', started_at_lt)
  }
  const snapshot = await ref.get()
  return snapshot.docs.map((doc) => {
    return {
      ...doc.data(),
      id: doc.id
    }
  })
}

export const batchCreate = async (events: Event[]): Promise<void> => {
  const batch = db.batch()
  for (const event of events) {
    const { group_id, owner_id, ...data } = event

    if (group_id !== undefined) {
      data.group = group_id ? db.collection('groups').doc(group_id) : null
    }
    if (owner_id !== undefined) {
      data.owner = owner_id ? db.collection('members').doc(owner_id) : null
    }

    const ref = db.collection('events').doc()
    batch.set(ref, data)
  }
  return await batch.commit()
}

export const batchUpdate = async (events: Event[]): Promise<void> => {
  const batch = db.batch()
  for (const event of events) {
    const { id, group_id, owner_id, ...data } = event

    if (group_id !== undefined) {
      data.group = group_id ? db.collection('groups').doc(group_id) : null
    }
    if (owner_id !== undefined) {
      data.owner = owner_id ? db.collection('members').doc(owner_id) : null
    }

    const ref = db.collection('events').doc(id)
    batch.update(ref, data)
  }
  return await batch.commit()
}

export const batchDelete = async (events: Event[]): Promise<void> => {
  const batch = db.batch()
  for (const event of events) {
    const { id } = event

    const ref = db.collection('events').doc(id)
    batch.delete(ref)
  }
  return await batch.commit()
}
