import { Message, MessagePayload, MessagePayloadOption } from "discord.js"
import 'dotenv/config'
import { mimes } from './mimes.js';
import * as fs from 'fs';
import * as stream from 'stream';
import { promisify } from 'util';
import axios from 'axios'
import type { Client } from "discordx";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
// @ts-ignore
import { fbdown, ttdl } from 'btch-downloader'

const DEBUG = process.env.DEBUG ? process.env.DEBUG.toLowerCase() === 'true' : false

export const removeReactions = async (message: Message) => {
    const userId = message.client.user.id
    const userReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(userId));

    try {
        for (const reaction of userReactions.values()) {
            await reaction.users.remove(userId);
        }
    } catch (error) {
        if (DEBUG) console.error('Failed to remove reactions.')
    }
}

const downloadFile = async (name: string, url: string, ext: string | null = null) => {
    const finishedDownload = promisify(stream.finished);

    const extensions = ['.png', '.jpg', '.jpeg', '.mp4', '.webp']
    let extension: string | null = null
    extensions.forEach((e) => (extension === null && url.includes(e)) ? extension = e : null)

    if (extension === null) {
        const response = await fetch(url);
        const contentType = response.headers.get('content-type')?.split(';')[0]?.trim() ?? null
        if (contentType) extension = mimes[contentType] ? '.' + mimes[contentType] : null
    }


    const filename = `${name}${ext ?? extension}`
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
        if (DEBUG) console.error(`error download file: ${url}`)
        return null
    }
}

const cobaltGetMedia = async (url: string): Promise<string[]> => {
    try {
        const { data: responseData } = await axios.post(`${process.env.COBALT_API_URL}/`, {
            url,
        }, {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        })
    
        const fileName = Math.floor(Date.now() / 1000).toString();
        if (responseData.status === 'redirect' || responseData.status === 'stream') {
            const filePath = await downloadFile(fileName, responseData.url)
            return filePath ? [filePath] : [];
        } else if (responseData.status === "picker") {
            const pickers = responseData.picker
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
    } catch (error) {
        if (DEBUG) console.error(error)
    }

    return [];
}

const scrapTwitter = async (link: string) => {
    try {
        const { data: responseData } = await axios.get(link.replace('//twitter.com/', '//api.vxtwitter.com/').replace('//x.com/', '//api.vxtwitter.com/'))

        let files: string[] = []
        for (let i = 0; i < responseData.mediaURLs.length; i++) {
            const url = responseData.mediaURLs[i];
            const filePath = await downloadFile(`${Math.floor(Date.now() / 1000).toString()}-${i}`, url)
            if (filePath) files.push(filePath)
        }

        return {
            embed: {
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
            },
            files,
        }
    } catch (error) {
        if (DEBUG) console.error(error)
        return {
            embed: null,
            files: [],
        };
    }
}

const scrapIG = async (link: string) => {
    const url = new URL(link)
    url.search = '';
    url.hash = '';

    try {
        await axios.get('https://instagram.com/accounts/remove/request/permanent/', {
            headers: {
                'Cookie': process.env.IG_COOKIES
            },
            withCredentials: true
        })
    } catch (error) {
        if (DEBUG) console.error(error)
    }

    try {
        const { data: responseData } = await axios.get(`${url.toString().replace('/reel/', '/p/').replace('/reels/', '/p/')}?__a=1&__d=dis`, {
            headers: {
                'Cookie': process.env.IG_COOKIES
            },
            withCredentials: true
        })

        let embed = null;
        let files: string[] = []

        if (responseData.num_results) {
            const item = responseData.items[0]

            embed = {
                color: 0xc72784,
                title: item.user?.full_name, // name
                url: `https://instagram.com/${item.user?.username}`,
                author: {
                    name: `@${item.user?.username}`, // username
                },
                description: item.caption?.text ?? null, // caption
                thumbnail: {
                    url: item.user?.hd_profile_pic_url_info?.url ?? null, // photo profile
                },
                timestamp: new Date(parseInt(item.taken_at + '000')).toISOString(),
                footer: {
                    text: 'Instagram',
                },
                files: [],
            }

            if (url.toString().includes('/reel')) {
                const video = item.video_versions ? item.video_versions[0] : null
                if (video && video.url) {
                    const filePath = await downloadFile(`${Math.floor(Date.now() / 1000).toString()}-reel`, video.url)
                    if (filePath) files.push(filePath)
                }
            } else {
                const medias = item.carousel_media ?? [item]
                for (let i = 0; i < medias.length; i++) {
                    const media = medias[i];

                    let url = null
                    if (media.video_versions?.length >= 1) {
                        url = media.video_versions[0]?.url
                    } else {
                        url = media.image_versions2?.candidates[0]?.url ?? null
                    }

                    if (url) {
                        const filePath = await downloadFile(`${Math.floor(Date.now() / 1000).toString()}-${i}`, url)
                        if (filePath) files.push(filePath)
                    }
                }
            }
        }

        return {
            embed,
            files,
        }
    } catch (error) {
        if (DEBUG) console.error(error)
        return {
            embed: null,
            files: [],
        };
    }
}

const scrapIGStories = async (link: string) => {
    const url = new URL(link)
    url.search = '';
    url.hash = '';

    const id = url.toString().split('instagram.com/')[1].split('/').filter((a) => a).slice(-1).pop() ?? null;

    try {
        const { data: responseIndown } = await axios.get('https://indown.io/get-url?privateLink=' + encodeURIComponent(url.toString()))

        let files: string[] = []

        const { data: responseData } = await axios.get(responseIndown.url, {
            headers: {
                'Cookie': process.env.IG_COOKIES
            },
            withCredentials: true
        })

        const media = responseData.data?.reels_media[0] ?? []
        const items = media?.items ?? []

        if (items.length >= 1 && items.length <= 10) {
            // @ts-ignore
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const url = item.video_resources ? (item.video_resources[0]?.src ?? null) : (item.display_url ?? null);
                if (id && id.match("[a-zA-Z]+") === null && id === item.id && url) {
                    const filePath = await downloadFile(`${Math.floor(Date.now() / 1000).toString()}-${i}`, url)
                    if (filePath) files.push(filePath)
                } else if (id && id.match("[a-zA-Z]+") !== null && url) {
                    const filePath = await downloadFile(`${Math.floor(Date.now() / 1000).toString()}-${i}`, url)
                    if (filePath) files.push(filePath)
                }
            }
        }

        return {
            files,
        }
    } catch (error) {
        if (DEBUG) console.error(error)
        return {
            files: [],
        };
    }
}

const scrapFacebook = async (link: string) => {
    let files: string[] = []
    try {
        let extension = null;
        const data = await fbdown(link)
        const dataArray = Object.keys(data).map((key) => data[key]);
        const mediaUrl = dataArray.length ? dataArray[0] : null;

        if (link.includes('watch')) {
            extension = '.mp4'
        }

        if (mediaUrl) {
            const filePath = await downloadFile(`${Math.floor(Date.now() / 1000).toString()}`, mediaUrl, extension)
            if (filePath) files.push(filePath)
        }

        return {
            files,
        }
    } catch (error) {
        if (DEBUG) console.error(error)
        return {
            files: [],
        };
    }
}

const scrapTiktok = async (link: string) => {
    try {
        const data = await ttdl(link)

        let files: string[] = []
        if (data?.video && data.video.length >= 1) {
            const filePath = await downloadFile(`${Math.floor(Date.now() / 1000).toString()}`, data.video[0])
            if (filePath) files.push(filePath)
        }

        const { data: responseData } = await axios.get(`https://www.tiktok.com/oembed?url=${link}`)
        return {
            embed: {
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
            },
            files,
        };
    } catch (error) {
        if (DEBUG) console.error(error)
        return {
            embed: null,
            files: [],
        };
    }
}

export const getSocialMediaInfo = async (link: string): Promise<string | MessagePayload | MessagePayloadOption | null> => {
    let files: string[] = []
    let embedComp = null
    if (["//twitter.com/", "//x.com/"].some((a) => link.includes(a))) {
        const scrapper = await scrapTwitter(link)
        files = scrapper.files
        embedComp = scrapper.embed
    } else if (["//tiktok.com/", "//www.tiktok.com/", "//vt.tiktok.com/"].some((a) => link.includes(a))) {
        const scrapper = await scrapTiktok(link)
        files = scrapper.files
        embedComp = scrapper.embed
    } else if (["//instagram.com/", "//www.instagram.com/"].some((a) => link.includes(a)) && ["/p/", "/reel/", "/reels/"].some((a) => link.includes(a))) {
        const scrapper = await scrapIG(link)
        files = scrapper.files
        embedComp = scrapper.embed
    } else if (["//instagram.com/", "//www.instagram.com/"].some((a) => link.includes(a)) && ["/stories/"].some((a) => link.includes(a))) {
        const scrapper = await scrapIGStories(link)
        files = scrapper.files
    } else if (["//facebook.com/", "//www.facebook.com/", "//fb.watch/", '//web.facebook.com/'].some((a) => link.includes(a))) {
        const scrapper = await scrapFacebook(link)
        files = scrapper.files
    }

    if (files.length === 0) files = await cobaltGetMedia(link)

    return { files: files.map((a) => ({ attachment: a })), embeds: embedComp ? [embedComp] : [] };
}

export const isScrappedMedia = (link: string | null = null): Boolean | String[] => {
    const allowed = [
        // instagram
        '//instagram.com/p',
        '//instagram.com/reel', // include reel & reels
        '//instagram.com/stories',
        '//instagram.com/share',
        '//www.instagram.com/p',
        '//www.instagram.com/reel', // include reel & reels
        '//www.instagram.com/stories',
        '//www.instagram.com/share',
        // twitter or x
        '//twitter.com/',
        '//x.com/',
        // tiktok
        '//tiktok.com/',
        '//www.tiktok.com/',
        '//vt.tiktok.com/',
        // facebook
        '//facebook.com/',
        '//www.facebook.com/',
        '//fb.watch/',
        '//web.facebook.com/',
        // BlueSky
        '//bsky.app/',
        // twitch
        '//twitch.tv/',
        '//www.twitch.tv/',
    ];

    if (link === null) {
        return allowed
    }

    return allowed.some((a) => link.includes(a))
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