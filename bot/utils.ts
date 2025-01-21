import Ffmpeg from "fluent-ffmpeg";
import { renameSync } from "fs";

export function compressVideo(inputPath: string, maxSizeMB = 8) {
    const splitDot = inputPath.split('.')
    const ext = splitDot[splitDot.length - 1]
    const outputPath = inputPath.replace(`.${ext}`, `-mini.${ext}`)

    return new Promise((resolve, reject) => {
        Ffmpeg.ffprobe(inputPath, (err, metadata) => {
            if (err) return reject(err);

            const duration = metadata.format.duration ?? 0; // in seconds
            const targetBitrate = ((maxSizeMB * 8 * 1024) / duration).toFixed(2); // in kbps

            Ffmpeg(inputPath)
                .output(outputPath)
                .outputOptions([
                    `-b:v ${targetBitrate}k`,       // Set video bitrate
                    `-b:a 128k`,                   // Set audio bitrate
                    '-movflags faststart',         // Optimize for web streaming
                    '-preset veryfast',            // Set encoding speed preset
                ])
                .size('?x720')                   // Optional: Scale to 720p max
                .on('end', function () {
                    // console.log('Video compression finished.');
                    renameSync(outputPath, inputPath)
                    resolve('Video processing finished')
                })
                .on('error', function (err) {
                    reject(new Error('Error during video processing: ' + err.message))
                })
                .run();
        })
    })
}