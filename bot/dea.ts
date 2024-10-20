import { Message, MessagePayload, MessagePayloadOption } from "discord.js"
import 'dotenv/config'
import { mimes } from './mimes.js';
import * as fs from 'fs';
import * as stream from 'stream';
import { promisify } from 'util';
import axios from 'axios'
import type { Client } from "discordx";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const removeReactions = async (message: Message) => {
    const userId = message.client.user.id
    const userReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(userId));

    try {
        for (const reaction of userReactions.values()) {
            await reaction.users.remove(userId);
        }
    } catch (error) {
        console.error('Failed to remove reactions.');
    }
}

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
    try {
        const response = await axios.get(url, {
            responseType: "stream",
        });

        response.data.pipe(writer)
        await finishedDownload(writer);

        return filePath
    } catch (error) {
        console.log(`error download file: ${url}`)
        return null
    }
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

export const getSocialMediaInfo = async (link: string): Promise<string | MessagePayload | MessagePayloadOption | null> => {
    const files = await cobaltGetMedia(link)
    let linkType: string | null = null;
    let embedLink: string | null = null;

    const embedLinkExcepts = ["ddinstagram.com/", "vxtwitter.com/", "www.vt.tiktok.com/"]
    if (embedLinkExcepts.some(el => link.includes(el))) {
        return null;
    }

    if (link.includes('//instagram.com/') && ["/p/", "/reel/", "/reels/"].some((a) => link.includes(a))) {
        embedLink = link.replace("instagram.com/", "ddinstagram.com/");
        linkType = 'ig'
    } else if (link.includes('//www.instagram.com/') && ["/p/", "/reel/", "/reels/"].some((a) => link.includes(a))) {
        embedLink = link.replace("www.instagram.com/", "ddinstagram.com/");
        linkType = 'ig'
    } else if (["//twitter.com/"].some((a) => link.includes(a))) {
        embedLink = link.replace("twitter.com/", "vxtwitter.com/");
        linkType = 'twitter'
    } else if (["//x.com/"].some((a) => link.includes(a))) {
        embedLink = link.replace("x.com/", "vxtwitter.com/")
        linkType = 'twitter'
    } else if (link.includes('//tiktok.com/') && ["/video", "/photo"].some((a) => link.includes(a))) {
        embedLink = link.replace("tiktok.com/", "vm.dstn.to/");
        linkType = 'tiktok'
    } else if (link.includes('//www.tiktok.com/') && ["/video", "/photo"].some((a) => link.includes(a))) {
        embedLink = link.replace("www.tiktok.com/", "vm.dstn.to/");
        linkType = 'tiktok'
    }

    if (files.length >= 1) {
        const mapFile = files.map((a) => ({ attachment: a }))
        let embedComp = null
        let data = { files: mapFile, embeds: [] }
        if (linkType === 'twitter' && embedLink) {
            const { data: responseData } = await axios.get(embedLink.replace('vxtwitter.com/', 'api.vxtwitter.com/'))
            embedComp = {
                color: 0x000000,
                title: responseData?.user_name, // name
                url: `https://x.com/${responseData?.user_screen_name}`,
                author: {
                    name: `@${responseData?.user_screen_name}`, // username
                },
                description: responseData?.text, // caption
                thumbnail: {
                    url: responseData?.user_profile_image_url.replace('_normal', ''), // photo profile
                },
                timestamp: new Date(responseData?.date).toISOString(),
                footer: {
                    text: 'X / Twitter',
                },
            };
        } else if (linkType === 'tiktok') {
            const { data: responseData } = await axios.get(`https://www.tiktok.com/oembed?url=${link}`)
            embedComp = {
                color: 0xfe2858,
                title: responseData?.author_name, // name
                url: `https://tiktok.com/@${responseData?.author_unique_id}`,
                author: {
                    name: `@${responseData?.author_unique_id}`, // username
                },
                description: responseData?.title, // caption
                footer: {
                    text: 'Tiktok',
                },
            };
        } else if (linkType === 'ig') {
            const { data: responseData } = await axios.get(`https://i.instagram.com/api/v1/oembed/?url=${link}`)
            embedComp = {
                color: 0xc72784,
                title: responseData?.author_name, // name
                url: `https://instagram.com/${responseData?.author_name}`,
                description: responseData?.title, // caption
                footer: {
                    text: 'Instagram',
                },
            };
        }

        // @ts-ignore
        if (embedComp !== null) data.embeds = [embedComp]
        return data
    } else if (embedLink) {
        return embedLink
    }

    return null;
}

export const isScrappedMedia = (link: string) => {
    return [
        // instagram
        '//instagram.com/p',
        '//instagram.com/reel', // include reel & reels
        '//www.instagram.com/p',
        '//www.instagram.com/reel', // include reel & reels
        // twitter or x
        '//twitter.com/',
        '//x.com/',
        // tiktok
        '//tiktok.com/',
        '//www.tiktok.com/',
        '//vt.tiktok.com/',
        // twitch
        '//twitch.tv/',
        // facebook
        '//facebook.com/',
        '//www.facebook.com/',
        // NOTE: add threads.net, must create scrapper with puppeteer and deployed to rasp. 
    ].some((a) => link.includes(a))
}

export const getLinks = (message: string) => {
    const msgHttp: Array<string> =
        message.match(/\bhttp?:\/\/\S+/gi) ?? [];
    const msgHttps: Array<string> =
        message.match(/\bhttps?:\/\/\S+/gi) ?? [];

    return msgHttp.concat(msgHttps);
}



export const handlerLink = async (message: Message, bot: Client) => {
    const links = getLinks(message.content)
    if (isScrappedMedia(links.join(' ')) && message.author.id !== bot.user?.id) {
        const no = new ButtonBuilder()
            .setCustomId('no')
            .setLabel('Nope')
            .setStyle(ButtonStyle.Danger);

        const yes = new ButtonBuilder()
            .setCustomId('get-media')
            .setLabel('Yes')
            .setStyle(ButtonStyle.Secondary);

        const withRemoveEmbed = new ButtonBuilder()
            .setCustomId('get-media-remove-embed')
            .setLabel('Also Remove Embed')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([yes, withRemoveEmbed, no]);

        await message.reply({
            content: `Want to get Media from link?`,
            components: [row],
        });
    }
};