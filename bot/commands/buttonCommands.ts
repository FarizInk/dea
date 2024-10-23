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

    if (result.length >= 1) {
      for (let i = 0; i < result.length; i++) {
        const data = result[i];
        // @ts-ignore
        if (data.files.length <= 10) {
          // @ts-ignore
          await message.reply(data)
        } else {
          // @ts-ignore
          const totalFiles = data.files.length
          let files = []
          for (let i = 0; i < totalFiles; i++) {
            // @ts-ignore
            const file = data.files[i];
            files.push(file)
            if ((i + 1) % 10 === 0) {
              await message.reply({
                files,
              })
              files = []
            } else if (i + 1 === totalFiles) {
              await message.reply({
                files,
                // @ts-ignore
                embeds: data.embeds
              })
            }
          }
        }
      }
      await interaction.message.delete()
    } else {
      await interaction.message.edit({
        content: 'No media Found 😔',
        components: [],
      })
    }

    for (let i = 0; i < result.length; i++) {
      const data = result[i];
      if (!data) return
      // @ts-ignore
      data.files?.forEach((file) => {
        fs.unlink(file?.attachment ?? null, () => null)
      })
    }

    await removeReactions(message)
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
