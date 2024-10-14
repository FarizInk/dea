import { Message } from "discord.js"
import 'dotenv/config'
import { mimes } from './mimes.js';
import * as fs from 'fs';
import * as stream from 'stream';
import { promisify } from 'util';
import axios from 'axios'
import type { Client } from "discordx";

const downloadFile = async (name: string, url: string) => {
    const finishedDownload = promisify(stream.finished);

    const extensions = ['.png', '.jpg', '.jpeg', '.mp4', '.webp']
    let extension: string | null = null
    extensions.forEach((e) => (extension === null && url.includes(e)) ? extension = e : null)

    if (extension === null) {
        const response = await fetch(url);
        const contentType = response.headers.get('content-type')?.split(';')[0]?.trim() ?? null
        if (contentType) extension = mimes[contentType] ? '.' + mimes[contentType] : null
    }


    const filename = `${name}${extension}`
    const filePath = './cache/' + filename
    const writer = fs.createWriteStream(filePath)
    const response = await axios.get(url, {
        responseType: "stream",
    });

    response.data.pipe(writer)
    await finishedDownload(writer);

    return filePath
}

const cobaltGetMedia = async (url: string): Promise<string[]> => {
    const r = await fetch(`${process.env.COBALT_API_URL}/api/json`, {
        method: 'POST',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ url })
    })
    const data = await r.json()

    const fileName = Math.floor(Date.now() / 1000).toString();
    if (data.status === 'redirect' || data.status === 'stream') {
        const filePath = await downloadFile(fileName, data.url)
        return filePath ? [filePath] : [];
    } else if (data.status === "picker") {
        const pickers = data.picker
        let filePaths: string[] = []
        for (let j = 0; j < pickers.length; j++) {
            const picker = pickers[j];
            const result = await downloadFile(`${fileName}-${j + 1}`, picker.url)
            if (result) {
                filePaths.push(result)
            }
        }
        return filePaths;
    }

    return [];
}

export const getSocialMediaInfo = async (message: Message, bot: Client) => {
    const msgHttp: Array<string> =
        message.toString().match(/\bhttp?:\/\/\S+/gi) ?? [];
    const msgHttps: Array<string> =
        message.toString().match(/\bhttps?:\/\/\S+/gi) ?? [];
    const links = msgHttp.concat(msgHttps);

    let startMsg: Message|null = null
    if (links.length && message.author.id !== bot.user?.id) {
        startMsg = await message.reply('processing link...')
    }

    links.forEach(async (link) => {
        const files = await cobaltGetMedia(link)
        let linkType: string | null = null;
        let embedLink: string | null = null;

        const embedLinkExcepts = ["ddinstagram.com/", "vxtwitter.com/", "www.vt.tiktok.com/"]
        if (embedLinkExcepts.some(el => link.includes(el))) {
            return;
        }

        if (["instagram.com/p/", "instagram.com/reels/", "instagram.com/reel/"].some((a) => link.includes(a))) {
            embedLink = link.replace("instagram.com/", "ddinstagram.com/");
            linkType = 'ig'
        } else if (["https://twitter.com/", "http://twitter.com/"].some((a) => link.includes(a))) {
            embedLink = link.replace("twitter.com/", "vxtwitter.com/");
            linkType = 'twitter'
        } else if (["http://x.com/", "https://x.com/"].some((a) => link.includes(a))) {
            embedLink = link.replace("x.com/", "vxtwitter.com/")
            linkType = 'twitter'
        } else if (["https://tiktok.com/", "http://tiktok.com/"].some((a) => link.includes(a))) {
            embedLink = link.replace("tiktok.com/", "vm.dstn.to/");
            linkType = 'tiktok'
        } else if (["https://www.tiktok.com/", "http://www.tiktok.com/"].some((a) => link.includes(a))) {
            embedLink = link.replace("www.tiktok.com/", "vm.dstn.to/");
            linkType = 'tiktok'
        }

        if (files.length >= 1) {
            const mapFile = files.map((a) => ({ attachment: a }))
            if (linkType === 'twitter' && embedLink) {
                const { data: responseData } = await axios.get(embedLink.replace('vxtwitter.com/', 'api.vxtwitter.com/'))
                await message.reply({
                    content: `"${responseData?.text}" - ${responseData?.user_name} (@${responseData?.user_screen_name})`,
                    files: mapFile
                })
            } else {
                await message.reply({ files: mapFile })
            }
            message.suppressEmbeds(true)

            files.forEach((a) => fs.unlink(a, () => null))
            if (startMsg) startMsg.delete();
        } else if (embedLink) {
            await message.reply(embedLink)
            message.suppressEmbeds(true)
            if (startMsg) startMsg.delete();
        } else if (startMsg) {
            startMsg.delete();
        }
    })
};