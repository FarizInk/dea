interface RawTextFacet {
  type: 'media' | string
  indices: [number, number]
  id: string
  display: string
  original: string
  replacement: string
}

interface RawText {
  text: string
  facets: RawTextFacet[]
}

interface Website {
  url: string
  display_url: string
}

interface Author {
  id: string
  name: string
  screen_name: string
  avatar_url: string
  banner_url: string
  description: string
  location: string
  url: string
  followers: number
  following: number
  joined: string
  likes: number
  website?: Website
  tweets: number
  avatar_color: string | null
}

interface MediaItem {
  type: 'photo' | string
  url: string
  width: number
  height: number
}

interface MosaicFormats {
  jpeg: string
  webp: string
}

interface Mosaic {
  type: 'mosaic_photo' | string
  formats: MosaicFormats
}

interface Media {
  all: MediaItem[]
  photos: MediaItem[]
  mosaic?: Mosaic
}

export interface FxTwitterResponse {
  url: string
  id: string
  text: string
  raw_text: RawText
  author: Author
  replies: number
  retweets: number
  likes: number
  created_at: string
  created_timestamp: number
  possibly_sensitive: boolean
  views: number
  is_note_tweet: boolean
  community_note: string | null
  lang: string
  replying_to: string | null
  replying_to_status: string | null
  media?: Media
  source: string
  twitter_card: string
  color: string | null
  provider: 'twitter' | string
}
