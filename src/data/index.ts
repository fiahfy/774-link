import { Group, Member } from '../models'
import groupsJson from './groups.json'
import membersJson from './members.json'

export const groups = groupsJson as Group[]
export const members = membersJson as Member[]

export const listMembers = (groupId: string): Member[] =>
  members.filter((member) => member.groupId === groupId)
