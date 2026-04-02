import type { TasteVector } from './taste'
import type { RecommendedMovie } from './recommendation'

export interface Group {
  id: string
  name: string
  invite_code: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  joined_at: string
  profile?: {
    display_name: string | null
    avatar_url: string | null
  }
}

export interface GroupWithMembers extends Group {
  members: GroupMember[]
  merged_profile: TasteVector | null
}

export interface GroupRecommendResponse {
  recommendations: RecommendedMovie[]
  group_id: string
  member_count: number
  shared_streaming: number[]
}

export interface GroupInvite {
  group_id: string
  group_name: string
  invite_code: string
  share_url: string
}
