const { DISCORD_TOKEN, DISCORD_CLIENT_ID, MASTER_ID, UPTIME_API_URL } =
  process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !MASTER_ID) {
  throw new Error("Missing environment variables");
}

export const config = {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  MASTER_ID,
  UPTIME_API_URL,
};

export const allowedUrls = [
  // instagram
  "//instagram.com/p",
  "//instagram.com/reel", // include reel & reels
  "//instagram.com/stories",
  "//instagram.com/share",
  "//www.instagram.com/p",
  "//www.instagram.com/reel", // include reel & reels
  "//www.instagram.com/stories",
  "//www.instagram.com/share",
  // twitter or x
  "//twitter.com/",
  "//x.com/",
  // tiktok
  "//tiktok.com/",
  "//www.tiktok.com/",
  "//vt.tiktok.com/",
  // facebook
  "//facebook.com/",
  "//www.facebook.com/",
  "//fb.watch/",
  "//web.facebook.com/",
  // BlueSky
  "//bsky.app/",
  // twitch
  "//twitch.tv/",
  "//www.twitch.tv/",
  // threads
  "//threads.net/",
  "//www.threads.net/",
  "//threads.com/",
  "//www.threads.com/",
];

interface MimesObjectType {
  [key: string]: string; // Define the type of properties in the object
}

export const mimes: MimesObjectType = {
  "audio/aac": "aac",
  "application/x-abiword": "abw",
  "application/x-freearc": "arc",
  "image/avif": "avif",
  "video/x-msvideo": "avi",
  "application/vnd.amazon.ebook": "azw",
  "application/octet-stream": "bin",
  "image/bmp": "bmp",
  "application/x-bzip": "bz",
  "application/x-bzip2": "bz2",
  "application/x-cdf": "cda",
  "application/x-csh": "csh",
  "text/css": "css",
  "text/csv": "csv",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/vnd.ms-fontobject": "eot",
  "application/epub+zip": "epub",
  "application/gzip": "gz",
  "image/gif": "gif",
  "text/html": "html",
  "text/calendar": "ics",
  "application/java-archive": "jar",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
  "text/javascript": "js",
  "application/json": "json",
  "application/ld+json": "jsonld",
  "audio/midi": "midi",
  "audio/x-midi": "midi",
  // "text/javascript": "mjs",
  "audio/mpeg": "mp3",
  "video/mp4": "mp4",
  "video/mpeg": "mpeg",
  "application/vnd.apple.installer+xml": "mpkg",
  "application/vnd.oasis.opendocument.presentation": "odp",
  "application/vnd.oasis.opendocument.spreadsheet": "ods",
  "application/vnd.oasis.opendocument.text": "odt",
  "audio/ogg": "oga",
  "video/ogg": "ogv",
  "application/ogg": "ogx",
  "audio/opus": "opus",
  "font/otf": "otf",
  "image/png": "png",
  "application/pdf": "pdf",
  "application/x-httpd-php": "php",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "pptx",
  "application/vnd.rar": "rar",
  "application/rtf": "rtf",
  "application/x-sh": "sh",
  "image/svg+xml": "svg",
  "application/x-tar": "tar",
  "image/tiff": "tiff",
  "video/mp2t": "ts",
  "font/ttf": "ttf",
  "text/plain": "txt",
  "application/vnd.visio": "vsd",
  "audio/wav": "wav",
  "audio/webm": "weba",
  "video/webm": "webm",
  "image/webp": "webp",
  "font/woff": "woff",
  "font/woff2": "woff2",
  "application/xhtml+xml": "xhtml",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/xml": "xml",
  "text/xml": "xml",
  "application/atom+xml": "xml",
  "application/vnd.mozilla.xul+xml": "xul",
  "application/zip": "zip",
  "video/3gpp": "3gp",
  "audio/3gpp": "3gp",
  "video/3gpp2": "3g2",
  "audio/3gpp2": "3g2",
  "application/x-7z-compressed": "7z",
};
