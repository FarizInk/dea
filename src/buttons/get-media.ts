import { ButtonBuilder, ButtonInteraction, ButtonStyle, MessageFlags } from "discord.js";
import { handleMessageLink } from "../dea";
import { botClient } from "../client";

export const btnGetMedia = new ButtonBuilder()
  .setCustomId('get-media')
  .setLabel('Yes!')
  .setStyle(ButtonStyle.Primary);

export async function execute(interraction: ButtonInteraction) {
  await interraction.message.edit({
    components: []
  });

  const msgContent = interraction.message.content
  const discordLinkRegex = /https:\/\/discord\.com\/channels\/\d+\/(?<channelId>\d+)\/(?<messageId>\d+)/;
  const match = msgContent.match(discordLinkRegex);
  if (match?.groups) {
    const { channelId, messageId } = match.groups;
    if (channelId && messageId) {
      const channel = await botClient.channels.fetch(channelId);
      if (channel?.isTextBased()) {
        const message = await channel.messages.fetch(messageId);
        await interraction.reply({
          content: 'Wait a moment, I am getting the media...',
          flags: MessageFlags.Ephemeral,
        });
        await handleMessageLink(message, message.content, botClient);
      }
    }
  } else {
    await interraction.reply({
      content: "No valid Discord message link found.",
      flags: MessageFlags.Ephemeral,
    });
  }
}