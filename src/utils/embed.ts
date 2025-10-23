import { isImageOrVideo } from '../utils'

export function getImageEmbed(files: string[]): string | null {
  let file: string | null = null

  for (const path of files) {
    if (file) break
    if (isImageOrVideo(path) === 'image') file = path
  }

  if (!file) return null

  const pathSplitter = file.split('/')
  return `attachment://${pathSplitter[pathSplitter.length - 1]}`
}
