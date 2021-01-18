import groupsJson from '774-link-data/groups.json'
import membersJson from '774-link-data/members.json'
import { Group, Member } from '../models'

export const groups = groupsJson as Group[]
export const members = membersJson as Member[]

export const findMember = (id: string): Member | undefined =>
  members.find((member) => member.id === id)
