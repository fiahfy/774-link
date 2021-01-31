import groupsJson from '774-link-data/groups.json'
import membersJson from '774-link-data/members.json'
import { Group, Member } from '../models'

export const groups = groupsJson as Group[]
export const members = membersJson as Member[]

export const findGroup = (id: string): Group | undefined =>
  groups.find((group) => group.id === id)

export const findMember = (id: string): Member | undefined =>
  members.find((member) => member.id === id)

export const listMembers = ({ ids }: { ids?: string[] } = {}): Member[] =>
  members.filter((member) => !ids || ids.includes(member.id))
