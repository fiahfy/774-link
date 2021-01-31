import groupsJson from '774-link-data/groups.json'
import membersJson from '774-link-data/members.json'
import { Group, Member } from '../models'

export const groups = groupsJson as Group[]
export const members = membersJson as Member[]

export const listGroups = ({
  sourceable,
}: {
  sourceable: boolean
}): Group[] => {
  return groups.filter((group) => group.sourceable === sourceable)
}

export const listMembers = ({
  groupIds,
}: { groupIds?: string[] } = {}): Member[] => {
  return members.filter(
    (member) => !groupIds || groupIds.includes(member.groupId)
  )
}
