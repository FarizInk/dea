import Ffmpeg from "fluent-ffmpeg";
import { renameSync } from "fs";
import * as fs from "fs";
import * as stream from "stream";
import { promisify } from "util";
import { mimes } from "./config";
import axios, { AxiosError } from "axios";
import * as path from "path";

export const downloadFile = async (
  name: string,
  url: string,
  ext: string | null = null
) => {
  const finishedDownload = promisify(stream.finished);

  const extensions = [".png", ".jpg", ".jpeg", ".mp4", ".webp"];
  let extension: string | null = null;
  extensions.forEach((e) =>
    extension === null && url.includes(e) ? (extension = e) : null
  );

  if (extension === null) {
    const response = await fetch(url);
    const filename = response.headers.get("content-disposition")?.split("filename=")[1]?.replace(/"/g, "") ?? null;
    for (const key in mimes) {
      const mime = mimes[key];
      if (mime === filename?.split(".").pop()) {
        extension = "." + mime;
        break;
      }
    }

    if (!extension) {
      const contentType =
        response.headers.get("content-type")?.split(";")[0]?.trim() ?? null;

      if (contentType)
        extension = mimes[contentType] ? "." + mimes[contentType] : null;
    }
  }

  const filename = `${name}${ext ?? extension}`;
  const filePath = "./cache/" + filename;
  const writer = fs.createWriteStream(filePath);
  try {
    const response = await axios.get(url, {
      responseType: "stream",
    });

    response.data.pipe(writer);
    await finishedDownload(writer);

    return filePath;
  } catch (error) {
    console.error(`error download file: ${url}, ${error instanceof AxiosError ? error.response?.data : error}`);
    return null;
  }
};

export function compressVideo(inputPath: string, maxSizeMB = 8) {
  const splitDot = inputPath.split(".");
  const ext = splitDot[splitDot.length - 1];
  const outputPath = inputPath.replace(`.${ext}`, `-mini.${ext}`);

  return new Promise((resolve, reject) => {
    Ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) return reject(err);

      const duration = metadata.format.duration ?? 0; // in seconds
      const audioBitrate = 128;
      const targetBitrate = (
        (maxSizeMB * 8 * 1024) / duration -
        audioBitrate
      ).toFixed(2); // in kbps

      Ffmpeg(inputPath)
        .output(outputPath)
        .outputOptions([
          `-b:v ${targetBitrate}k`, // Set video bitrate
          `-b:a ${audioBitrate}k`, // Set audio bitrate
          "-movflags faststart", // Optimize for web streaming
          "-preset veryfast", // Set encoding speed preset
        ])
        .size("?x720") // Optional: Scale to 720p max
        .on("end", function () {
          renameSync(outputPath, inputPath);
          resolve("Video processing finished");
        })
        .on("error", function (err) {
          reject(new Error("Error during video processing: " + err.message));
        })
        .run();
    });
  });
}

export const removeCacheFiles = () => {
  fs.readdir("./cache", (err, files) => {
    if (err) {
      console.error(err);
    }

    files.forEach((file) => {
      const fileDir = path.join("./cache", file);

      if (file !== ".gitignore") {
        fs.unlinkSync(fileDir);
      }
    });
  });
};

export const getEmbed = (response) => {
  const data = response.data ?? null;

  if (response.via === "vxtwitter") {
    return {
      color: 0x000000,
      title: data?.user_name, // name
      url: `https://x.com/${data?.user_screen_name}`,
      author: {
        name: `@${data?.user_screen_name}`, // username
      },
      description: data?.text, // caption
      thumbnail: {
        url: data?.user_profile_image_url.replace("_normal", ""), // photo profile
      },
      timestamp: new Date(data?.date).toISOString(),
      footer: {
        text: "X / Twitter",
      },
    };
  } else if (response.via === "ig-cookies") {
    const name = data.user?.username ? `@${data.user?.username}` : null;
    if (!name) return null;
    return {
      color: 0xc72784,
      title: data.user?.full_name, // name
      url: `https://instagram.com/${data.user?.username}`,
      author: {
        name, // username
      },
      description: data.caption?.text ?? null, // caption
      thumbnail: {
        url: data.user?.hd_profile_pic_url_info?.url ?? null, // photo profile
      },
      timestamp: data.taken_at ? new Date(parseInt(data.taken_at + "000")).toISOString() : null,
      footer: {
        text: "Instagram",
      },
      files: [],
    };
  } else if (response.via === "ig") {
    const caption = data?.data_to_caption?.edges[0]?.node?.text ?? null;
    const username = data?.owner?.username ?? null;
    const name = data?.owner?.full_name ?? null;
    const profilePic = data?.owner?.profile_pic_url ?? null;
    const takenAt = data?.taken_at_timestamp ? new Date(parseInt(data.taken_at_timestamp + "000")).toISOString() : null;
    if (!username || !name || !takenAt) return null;
    return {
      color: 0xc72784,
      title: name, // name
      url: `https://instagram.com/${username}`,
      author: {
        name: `@${username}`, // username
      },
      description: caption ?? null, // caption
      thumbnail: {
        url: profilePic ?? null, // photo profile
      },
      timestamp: takenAt,
      footer: {
        text: "Instagram",
      },
    };
  } else if (response.via === "btch-downloader" && response.platform === "tiktok") {
    return {
      color: 0xfe2858,
      title: data?.author_name, // name
      url: `https://tiktok.com/@${data?.author_unique_id}`,
      author: {
        name: `@${data?.author_unique_id}`, // username
      },
      description: data?.title, // caption
      footer: {
        text: "Tiktok",
      },
    };
  }

  return null;
};
