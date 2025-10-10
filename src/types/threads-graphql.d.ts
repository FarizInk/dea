interface UserInfo {
  friendship_status: any | null
  id: string
  pk: string
  transparency_label: string | null
  transparency_product: string | null
  transparency_product_enabled: boolean
  is_verified: boolean
  username: string
  profile_pic_url: string
}

interface PinnedPostInfo {
  is_pinned_to_profile: boolean
  is_pinned_to_parent_post: boolean
}

interface ShareInfo {
  reposted_post: any | null

  quoted_post: any | null
  __typename: 'XDTShareInfo'
  can_quote_post: boolean
  can_repost: boolean
  is_reposted_by_viewer: boolean
  repost_restricted_reason: 'private' | string // Add other possible values if known
}

interface TextPostAppInfo {
  is_post_unavailable: boolean
  pinned_post_info: PinnedPostInfo
  share_info: ShareInfo
  reply_to_author: string | null
  direct_reply_count: number

  hush_info: any | null
  can_reply: boolean
  is_reply: boolean

  link_preview_attachment: any | null

  fediverse_info: any | null
  post_unavailable_reason: string | null
}

interface ImageCandidate {
  url: string
  height: number
  width: number
}

interface ImageVersions2 {
  candidates: ImageCandidate[]
}

interface VideoVersion {
  type: number
  url: string
  __typename: 'XDTVideoVersion'
}

interface CarouselMediaItem {
  accessibility_caption: string | null
  has_audio: boolean | null
  image_versions2: ImageVersions2
  original_height: number
  original_width: number
  pk: string
  video_versions: VideoVersion[] | null
  id: string
  code: string | null
}

interface Caption {
  text: string
}

export interface ThreadsGraphQLResponse {
  pk: string
  user: UserInfo
  text_post_app_info: TextPostAppInfo
  id: string
  is_paid_partnership: boolean | null
  is_fb_only: boolean | null
  is_internal_only: boolean | null
  code: string
  carousel_media: CarouselMediaItem[] | null
  image_versions2: ImageVersions2
  original_height: number
  original_width: number
  video_versions: null
  like_count: number
  audio: null
  caption: Caption
  caption_is_edited: boolean

  transcription_data: any | null
  accessibility_caption: string
  has_audio: boolean | null
  media_type: number
  has_liked: boolean
  caption_add_on: null
  media_overlay_info: null

  giphy_media_info: any | null

  text_with_entities: any | null
  taken_at: number
  organic_tracking_token: string
  like_and_view_counts_disabled: boolean
}
