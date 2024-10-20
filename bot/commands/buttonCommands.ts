import { Message, MessagePayload, MessagePayloadOption, type ButtonInteraction } from "discord.js";
import {
  Discord,
  ButtonComponent
} from "discordx";
import { getLinks, getSocialMediaInfo, isScrappedMedia, removeReactions } from "../dea.js";
import * as fs from 'fs';

@Discord()
export class Example {
  async getMedia(interaction: ButtonInteraction, message: Message) {
    const links = getLinks(message.content)
    await message.react('🫰');

    let result: Array<string|MessagePayload|MessagePayloadOption> = []
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      if (isScrappedMedia(link)) {
        const data = await getSocialMediaInfo(link)
        if (data) result.push(data) 
      }
    }


    if (result.length >= 2) {
      // @ts-ignore
      result.forEach(async (data: string|MessagePayload|MessagePayloadOption) => await message.reply(data))
      await interaction.message.delete()
    } else if (result.length === 1) {
      await interaction.message.edit({
        // @ts-ignore
        ...result[0],
        content: null,
        components: [],
      })
    } else {
      await interaction.message.edit({
        content: 'No media Found 😔',
        components: [],
      })
      await interaction.message.delete()
    }

    result?.forEach((data) => {
      if (!data) return
      // @ts-ignore
      data.files?.forEach((file) => {
        fs.unlink(file?.attachment ?? null, () => null)
      })
    })

    if (isScrappedMedia(links.join(' ')) && message.author.id !== interaction.user?.id) await removeReactions(interaction.user.id, message)
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

    await this.getMedia(interaction, message)
    message.suppressEmbeds(true)
  }
}
