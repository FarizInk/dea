import Ffmpeg from 'fluent-ffmpeg'
import { renameSync } from 'fs'
import * as fs from 'fs'
import * as stream from 'stream'
import { promisify } from 'util'
import { mimes } from '../config'
import axios, { AxiosError } from 'axios'
import * as path from 'path'
import { REST, Routes } from 'discord.js'
import { config } from '../config'
import { commands } from '../commands'

type DeployCommandsProps = {
  guildId: null | string
}

export const downloadFile = async (
  name: string,
  url: string,
  ext: string | null = null
) => {
  const finishedDownload = promisify(stream.finished)

  const extensions = ['.png', '.jpg', '.jpeg', '.mp4', '.webp']
  let extension: string | null = null
  extensions.forEach(e =>
    extension === null && url.includes(e) ? (extension = e) : null
  )

  if (extension === null) {
    const response = await fetch(url)
    const filename =
      response.headers
        .get('content-disposition')
        ?.split('filename=')[1]
        ?.replace(/"/g, '') ?? null
    for (const key in mimes) {
      const mime = mimes[key]
      if (mime === filename?.split('.').pop()) {
        extension = '.' + mime
        break
      }
    }

    if (!extension) {
      const contentType =
        response.headers.get('content-type')?.split(';')[0]?.trim() ?? null

      if (contentType)
        extension = mimes[contentType] ? '.' + mimes[contentType] : null
    }
  }

  const filename = `${name}${ext ?? extension}`
  const filePath = './cache/' + filename
  const writer = fs.createWriteStream(filePath)
  try {
    const response = await axios.get(url, {
      responseType: 'stream',
    })

    response.data.pipe(writer)
    await finishedDownload(writer)

    return filePath
  } catch (error) {
    console.error(
      `error download file: ${url}, ${error instanceof AxiosError ? error.message : error}`
    )
    return null
  }
}

export function compressVideo(inputPath: string, maxSizeMB = 8) {
  const splitDot = inputPath.split('.')
  const ext = splitDot[splitDot.length - 1]
  const outputPath = inputPath.replace(`.${ext}`, `-mini.${ext}`)

  return new Promise((resolve, reject) => {
    Ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) return reject(err)

      const duration = metadata.format.duration ?? 0 // in seconds
      const audioBitrate = 128
      const targetBitrate = (
        (maxSizeMB * 8 * 1024) / duration -
        audioBitrate
      ).toFixed(2) // in kbps

      Ffmpeg(inputPath)
        .output(outputPath)
        .outputOptions([
          `-b:v ${targetBitrate}k`, // Set video bitrate
          `-b:a ${audioBitrate}k`, // Set audio bitrate
          '-movflags faststart', // Optimize for web streaming
          '-preset veryfast', // Set encoding speed preset
        ])
        .size('?x720') // Optional: Scale to 720p max
        .on('end', function () {
          renameSync(outputPath, inputPath)
          resolve('Video processing finished')
        })
        .on('error', function (err) {
          reject(new Error('Error during video processing: ' + err.message))
        })
        .run()
    })
  })
}

export const removeCacheFiles = () => {
  fs.readdir('./cache', (err, files) => {
    if (err) {
      console.error(err)
    }

    files.forEach(file => {
      const fileDir = path.join('./cache', file)

      if (file !== '.gitignore') {
        fs.unlinkSync(fileDir)
      }
    })
  })
}

export function kebabToCamel(str: string) {
  return str.replace(/-(\w)/g, (_, c) => c.toUpperCase())
}

export async function deployCommands({ guildId = null }: DeployCommandsProps) {
  const commandsData = Object.values(commands).map(command => command.data)
  const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN)

  try {
    console.info('Started refreshing application (/) commands.')

    if (guildId) {
      await rest.put(
        Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, guildId),
        {
          body: commandsData,
        }
      )
    } else {
      await rest.put(Routes.applicationCommands(config.DISCORD_CLIENT_ID), {
        body: commandsData,
      })
    }

    console.info('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error(error)
  }
}

export function isImageOrVideo(filename: string) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
  const videoExtensions = [
    '.mp4',
    '.avi',
    '.mov',
    '.wmv',
    '.flv',
    '.webm',
    '.mkv',
  ]

  const ext = filename.toLowerCase().split('.').pop()

  if (imageExtensions.includes(`.${ext}`)) return 'image'
  if (videoExtensions.includes(`.${ext}`)) return 'video'
  return 'unknown'
}

export function removeEnding(str: string, ending: string) {
  if (ending !== '' && str.endsWith(ending)) {
    return str.slice(0, -ending.length)
  }
  return str
}
