interface Author {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
  associated?: {
    chat?: {
      allowIncoming?: string;
    };
  };
  viewer?: {
    muted?: boolean;
    blockedBy?: boolean;
  };
  labels: string[];
  createdAt?: string;
}

interface AspectRatio {
  height: number;
  width: number;
}

interface BlobRef {
  $link: string;
}

interface Blob {
  $type: string;
  ref: BlobRef;
  mimeType: string;
  size: number;
}

interface Image {
  alt: string;
  aspectRatio?: AspectRatio;
  image: Blob;
}

export interface ImagesEmbed {
  $type: 'app.bsky.embed.images';
  images: Image[];
}

interface LinkFacetFeature {
  $type: 'app.bsky.richtext.facet#link';
  uri: string;
}

interface TagFacetFeature {
  $type: 'app.bsky.richtext.facet#tag';
  tag: string;
}

interface FacetIndex {
  byteEnd: number;
  byteStart: number;
}

interface Facet {
  features: (LinkFacetFeature | TagFacetFeature)[];
  index: FacetIndex;
}

interface Record {
  $type: string;
  createdAt: string;
  embed?: ImagesEmbed | VideoEmbed;
  facets?: Facet[];
  langs?: string[];
  text?: string;
}

interface ImagesEmbedViewImage {
  thumb?: string;
  fullsize?: string;
  alt: string;
  aspectRatio?: AspectRatio;
}

interface ImagesEmbedView {
  $type: 'app.bsky.embed.images#view';
  images: ImagesEmbedViewImage[];
}

interface VideoBlob {
  $type: 'blob';
  ref: BlobRef;
  mimeType: 'video/mp4';
  size: number;
}

interface VideoEmbed {
  $type: 'app.bsky.embed.video';
  alt: string;
  aspectRatio?: AspectRatio;
  video: VideoBlob;
}

interface VideoEmbedView {
  $type: 'app.bsky.embed.video#view';
  cid?: string;
  playlist?: string;
  thumbnail?: string;
  alt: string;
  aspectRatio?: AspectRatio;
}

interface Viewer {
  threadMuted?: boolean;
  embeddingDisabled?: boolean;
}

export interface BskxResponse {
  uri: string;
  cid: string;
  author: Author;
  record: Record;
  embed?: ImagesEmbedView | VideoEmbedView;
  replyCount?: number;
  repostCount?: number;
  likeCount?: number;
  quoteCount?: number;
  indexedAt?: string;
  viewer?: Viewer;
  labels: string[];
}
