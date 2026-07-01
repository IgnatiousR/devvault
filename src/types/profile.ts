export interface ProfileUser {
  id: string
  email: string
  name: string | null
  image: string | null
  createdAt: string
  isPro: boolean
  hasPassword: boolean
}

export interface ProfileStats {
  totalItems: number
  totalCollections: number
  itemTypeBreakdown: ItemTypeCount[]
}

export interface ItemTypeCount {
  id: string
  name: string
  icon: string
  color: string
  count: number
}

export interface ProfileData {
  user: ProfileUser
  stats: ProfileStats
}