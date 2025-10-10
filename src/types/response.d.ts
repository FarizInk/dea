import type { CobaltResponse } from './cobalt'
import type { FxTwitterResponse } from './fxtwitter'
import type { InstagramGraphQLResponse } from './instagram-graphql'
import type { InstagramStoryClientResponse } from './instagram-story-client'
import type { ThreadsGraphQLResponse } from './threads-graphql'
import type { TikTokParserResponse } from './tiktok'
import type { VxTwitterResponse } from './vxtwitter'

type ProviderType =
  | string
  | null
  | 'cobalt'
  | 'fxtwitter'
  | 'vxtwitter'
  | 'instagram-graphql'
  | 'instagram-story-client'
  | 'threads-graphql'
  | 'bskx'
  | 'tiktok-parser'
  | 'btch-downloader'

export interface Response {
  platform:
    | string
    | 'unknown'
    | 'x'
    | 'instagram'
    | 'tiktok'
    | 'thread'
    | 'bluesky'
  medias: string[]
  data:
    | null
    | CobaltResponse
    | FxTwitterResponse
    | InstagramGraphQLResponse
    | InstagramStoryClientResponse
    | ThreadsGraphQLResponse
    | VxTwitterResponse
    | TikTokParserResponse
    | any
  metadata: {
    provider_media: ProviderType
    provider_data: ProviderType
  }
}
