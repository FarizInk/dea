import Ffmpeg from "fluent-ffmpeg";
import { renameSync } from "fs";

export function compressVideo(inputPath: string) {
    const splitDot = inputPath.split('.')
    const ext = splitDot[splitDot.length - 1]
    const outputPath = inputPath.replace(`.${ext}`, `-mini.${ext}`)

    return new Promise((resolve, reject) => {
        Ffmpeg(inputPath)
            .output(outputPath)
            .videoCodec('libx264')    // Video codec (H.264 is a good choice for compression)
            .audioCodec('aac')        // Audio codec (AAC is widely supported)
            .withVideoBitrate(1000)   // Adjust bitrate for compression (in kilobits per second)
            .withAudioBitrate(128)    // Adjust audio bitrate (in kilobits per second)
            // .size('1280x720')         // Optional: Resize video (e.g., to 720p)
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
}