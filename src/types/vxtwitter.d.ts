interface MediaExtended {
  altText: string | null
  size: {
    height: number
    width: number
  }
  thumbnail_url: string
  type: 'image' | string
  url: string
}

export interface VxTwitterResponse {
  allSameType: boolean
  article: null
  combinedMediaUrl: string
  communityNote: null
  conversationID: string
  date: string
  date_epoch: number
  hasMedia: boolean

  hashtags: any[] // Assuming an array of strings or other hashtag-related objects
  lang: string
  likes: number
  mediaURLs: string[]
  media_extended: MediaExtended[]
  pollData: null
  possibly_sensitive: boolean
  qrt: null
  qrtURL: null
  replies: number
  replyingTo: string | null
  retweets: number
  text: string
  tweetID: string
  tweetURL: string
  user_name: string
  user_profile_image_url: string
  user_screen_name: string
}
