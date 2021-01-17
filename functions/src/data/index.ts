import groupsJson from '774-link/src/data/groups.json'
import membersJson from '774-link/src/data/members.json'
import { Group, Member } from '../models'

export const groups = groupsJson as Group[]
export const members = membersJson as Member[]
