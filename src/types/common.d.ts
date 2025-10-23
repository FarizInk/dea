// Common types used across multiple platforms

export interface BaseMediaItem {
  url: string
  width: number
  height: number
}

export interface BaseAuthor {
  id: string
  name: string
  avatar_url: string
}

export interface BaseStats {
  likes: number
  shares: number
  comments: number
}

export interface MediaDimensions {
  height: number
  width: number
}
