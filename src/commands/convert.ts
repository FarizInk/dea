import axios from "axios";
import { load } from "cheerio";
import {
  bold,
  CommandInteraction,
  italic,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

function removeEnding(str: string, ending: string) {
  if (ending !== "" && str.endsWith(ending)) {
    return str.slice(0, -ending.length);
  }
  return str;
}

export const data = new SlashCommandBuilder()
  .setName("convert")
  .setDescription("Convert Currency")
  .addIntegerOption((option) =>
    option
      .setName("amount")
      .setDescription("write the amount without comma and dot")
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("from")
      .setDescription("From Currency Code")
      .setRequired(true),
  )
  .addStringOption((option) =>
    option.setName("to").setDescription("To Currency Code").setRequired(true),
  );

export async function execute(interaction: CommandInteraction) {
  const fromValue = interaction.options.get("from")?.value ?? null;
  const toValue = interaction.options.get("to")?.value ?? null;
  const from = typeof fromValue === "string" ? fromValue.toUpperCase() : null;
  const to = typeof toValue === "string" ? toValue.toUpperCase() : null;
  const amount = interaction.options.get("amount")?.value;

  if (!from || !to || amount === null || amount === undefined) {
    return interaction.reply({
      content: "Your Input not valid.",
      flags: MessageFlags.Ephemeral,
    });
  }

  try {
    const url = `https://www.xe.com/currencyconverter/convert/?Amount=${amount}&From=${from}&To=${to}`;
    const { data } = await axios.get(url);

    const $ = load(data);
    const baseElement = "div[data-testid=conversion] > div > div > div";
    const textFrom = $(`${baseElement} > p:nth-child(1)`).text();
    const nominalFrom = textFrom.split(" ")?.[0]?.trim();
    const currencyFrom = textFrom
      .split(" ")
      .slice(1)
      .join(" ")
      .replace("=", "")
      .trim();
    const fadedDigits = $(`${baseElement} > p:nth-child(2) > span.faded-digits`)
      .text()
      .trim();
    const textTo = $(`${baseElement} > p:nth-child(2)`).text();
    const nominalTo = textTo.split(" ")?.[0]?.trim() ?? "";
    const currencyTo = textTo.split(" ").slice(1).join(" ");

    return interaction.reply({
      content: `${bold(nominalFrom ?? "")} ${bold(currencyFrom)} = ${bold(removeEnding(nominalTo, fadedDigits))}${fadedDigits ? italic(fadedDigits) : ""} ${bold(currencyTo)}`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    console.error(error);
    return interaction.reply({
      content: "Something Wrong 😞",
      flags: MessageFlags.Ephemeral,
    });
  }
}
