import type { CobaltResponse } from "./cobalt";
import type { FxTwitterResponse } from "./fxtwitter";
import type { InstagramGraphQLResponse } from "./instagram-graphql";
import type { InstagramStoryClientResponse } from "./instagram-story-client";
import type { ThreadsGraphQLResponse } from "./threads-graphql";
import type { TikTokParserResponse } from "./tiktok";
import type { VxTwitterResponse } from "./vxtwitter";

export interface Response {
  via:
    | string
    | null
    | "cobalt"
    | "fxtwitter"
    | "vxtwitter"
    | "instagram-graphql"
    | "instagram-story-client"
    | "threads-graphql"
    | "bskx"
    | "tiktok-parser"
    | "btch-downloader";
  platform:
    | string
    | "unknown"
    | "x"
    | "instagram"
    | "tiktok"
    | "thread"
    | "bluesky";
  medias: string[];
  data:
    | null
    | CobaltResponse
    | FxTwitterResponse
    | InstagramGraphQLResponse
    | InstagramStoryClientResponse
    | ThreadsGraphQLResponse
    | VxTwitterResponse
    | TikTokParserResponse
    | BskxResponse;
}
