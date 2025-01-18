import { Message, MessagePayload, MessagePayloadOption, type ButtonInteraction } from "discord.js";
import {
  Discord,
  ButtonComponent
} from "discordx";
import { getLinks, getSocialMediaInfo, isScrappedMedia, removeReactions } from "../dea.js";
import * as fs from 'fs';
import { compressVideo } from '../utils.js'

@Discord()
export class Example {
  async getMedia(interaction: ButtonInteraction, message: Message) {
    const links = getLinks(message.content)
    await message.react('🫰');

    await interaction.message.edit({
      content: 'Getting Media...',
      components: [],
    })

    let result: Array<string | MessagePayload | MessagePayloadOption> = []
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      if (isScrappedMedia(link)) {
        const data = await getSocialMediaInfo(link)
        if (data) result.push(data)
      }
    }

    for (let index = 0; index < result.length; index++) {
      const item = result[index];
      // @ts-ignore
      const files = item.files;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const stats = fs.statSync(file.attachment)
        if (stats.size / (1024 * 1024) >= 8) {
          await compressVideo(file.attachment)
        }
      }


      // @ts-ignore
      if (item.embeds && item.embeds.length === 0 && item.files && item.files.length === 0) {
        result.splice(index, 1)
      }
    }

    if (result.length === 0) {
      await interaction.message.edit({
        content: 'No media Found 😔',
        components: [],
      })
      return result;
    }

    for (let i = 0; i < result.length; i++) {
      const data = result[i];
      // @ts-ignore
      const totalFiles = data.files.length

      if (totalFiles <= 10) {
        // @ts-ignore
        await message.reply(data)
        continue;
      }

      let files = []
      for (let i = 0; i < totalFiles; i++) {
        // @ts-ignore
        files.push(data.files[i])

        if (i + 1 === totalFiles) {
          await message.reply({
            files,
            // @ts-ignore
            embeds: data.embeds
          })
        } else if ((i + 1) % 10 === 0) {
          await message.reply({
            files
          })
          files = []
        }

      }
    }

    await interaction.message.delete()

    for (let i = 0; i < result.length; i++) {
      const data = result[i];
      if (!data) return
      // @ts-ignore
      data.files?.forEach((file) => {
        fs.unlink(file?.attachment ?? null, () => null)
      })
    }

    await removeReactions(message)

    return result;
  }

  @ButtonComponent({ id: "no" })
  async nobButtonAction(interaction: ButtonInteraction): Promise<void> {
    await interaction.message.delete();
  }

  @ButtonComponent({ id: "get-media" })
  async getMediaAction(interaction: ButtonInteraction): Promise<void> {
    const repliedId = interaction.message?.reference?.messageId ?? null
    if (!repliedId) return;
    const message = await interaction.message.channel.messages.fetch(repliedId);

    await this.getMedia(interaction, message)
  }

  @ButtonComponent({ id: "get-media-remove-embed" })
  async alsoRemoveEmbed(interaction: ButtonInteraction): Promise<void> {
    const repliedId = interaction.message?.reference?.messageId ?? null
    if (!repliedId) return;
    const message = await interaction.message.channel.messages.fetch(repliedId);

    const result = await this.getMedia(interaction, message)
    if (result && Array.isArray(result) && result.length >= 1) {
      message.suppressEmbeds(true)
    }
  }
}
