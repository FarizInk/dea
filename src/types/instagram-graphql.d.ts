export interface InstagramGraphQLResponse {
  __typename: string;
  __isXDTGraphMediaInterface: string;
  id: string;
  shortcode: string;
  thumbnail_src: string;
  dimensions: {
    height: number;
    width: number;
  };
  gating_info: null;
  fact_check_overall_rating: null;
  fact_check_information: null;
  sensitivity_friction_info: null;
  sharing_friction_info: {
    should_have_sharing_friction: boolean;
    bloks_app_url: null;
  };
  media_overlay_info: null;
  media_preview: null | string;
  display_url: string;
  display_resources: {
    src: string;
    config_width: number;
    config_height: number;
  }[];
  is_video: boolean;
  tracking_token: string;
  upcoming_event: null;
  edge_media_to_tagged_user: {
    edges: {
      node: {
        id: string;
        username: string;
        is_verified: boolean;
        profile_pic_url: string;
      };
    }[];
  };
  owner: {
    id: string;
    username: string;
    is_verified: boolean;
    profile_pic_url: string;
    blocked_by_viewer: boolean;
    restricted_by_viewer: null;
    followed_by_viewer: boolean;
    full_name: string;
    has_blocked_viewer: boolean;
    is_embeds_disabled: boolean;
    is_private: boolean;
    is_unpublished: boolean;
    requested_by_viewer: boolean;
    pass_tiering_recommendation: boolean;
    edge_owner_to_timeline_media: {
      count: number;
    };
    edge_followed_by: {
      count: number;
    };
  };
  accessibility_caption: null | string;
  video_url?: string;
  edge_sidecar_to_children: {
    edges: {
      node: {
        __typename: string;
        id: string;
        shortcode: string;
        dimensions: {
          height: number;
          width: number;
        };
        gating_info: null;
        fact_check_overall_rating: null;
        fact_check_information: null;
        sensitivity_friction_info: null;
        sharing_friction_info: {
          should_have_sharing_friction: boolean;
          bloks_app_url: null;
        };
        media_overlay_info: null;
        media_preview: null | string;
        display_url: string;
        display_resources: {
          src: string;
          config_width: number;
          config_height: number;
        }[];
        accessibility_caption: null | string;
        dash_info: {
          is_dash_eligible: boolean;
          video_dash_manifest: string;
          number_of_qualities: number;
        };
        has_audio: boolean;
        video_url: string;
        video_view_count: number;
        video_play_count: null | number;
        is_video: boolean;
        tracking_token: string;
        upcoming_event: null;
        edge_media_to_tagged_user: {
          edges: any[];
        };
      };
    }[];
  };
  edge_media_to_caption: {
    edges: {
      node: {
        created_at: string;
        text: string;
        id: string;
      };
    }[];
  };
  can_see_insights_as_brand: boolean;
  caption_is_edited: boolean;
  has_ranked_comments: boolean;
  like_and_view_counts_disabled: boolean;
  edge_media_to_parent_comment: {
    count: number;
    page_info: {
      has_next_page: boolean;
      end_cursor: string | null;
    };
    edges: {
      node: {
        id: string;
        text: string;
        created_at: number;
        did_report_as_spam: boolean;
        owner: {
          id: string;
          is_verified: boolean;
          profile_pic_url: string;
          username: string;
        };
        viewer_has_liked: boolean;
        edge_liked_by: {
          count: number;
        };
        is_restricted_pending: boolean;
        edge_threaded_comments: {
          count: number;
          page_info: {
            has_next_page: boolean;
            end_cursor: string | null;
          };

          edges: any[];
        };
      };
    }[];
  };
  edge_media_to_hoisted_comment: {
    edges: any[];
  };
  edge_media_preview_comment: {
    count: number;
    edges: {
      node: {
        id: string;
        text: string;
        created_at: number;
        did_report_as_spam: boolean;
        owner: {
          id: string;
          is_verified: boolean;
          profile_pic_url: string;
          username: string;
        };
        viewer_has_liked: boolean;
        edge_liked_by: {
          count: number;
        };
        is_restricted_pending: boolean;
      };
    }[];
  };
  comments_disabled: boolean;
  commenting_disabled_for_viewer: boolean;
  taken_at_timestamp: number;
  edge_media_preview_like: {
    count: number;

    edges: any[];
  };
  edge_media_to_sponsor_user: {
    edges: any[];
  };
  is_affiliate: boolean;
  is_paid_partnership: boolean;
  location: null | string;
  nft_asset_info: null | string;
  viewer_has_liked: boolean;
  viewer_has_saved: boolean;
  viewer_has_saved_to_collection: boolean;
  viewer_in_photo_of_you: boolean;
  viewer_can_reshare: boolean;
  is_ad: boolean;
  edge_web_media_to_related_media: {
    edges: any[];
  };

  coauthor_producers: any[];

  pinned_for_users: any[];
}
