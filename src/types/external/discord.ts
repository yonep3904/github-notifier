/**
 * Type definitions for Discord Webhook messages
 * Ref: https://docs.discord.com/developers/resources/webhook
 */
import type { ISO8601 } from "@/types/utility/scalars";

export type DiscordColor = number; // Decimal color code (e.g. 16711680 = red)

export type EmbedFooter = {
  text: string;
  icon_url?: string; // Small icon displayed to the left of the text
};

export type EmbedImage = {
  url: string;
};

export type EmbedAuthor = {
  name?: string;
  url?: string; // Link when the author name is clicked
  icon_url?: string;
};

export type EmbedField = {
  name: string;
  value: string; // Supports Markdown
  inline?: boolean; // Display fields inline
};

export type Embed = {
  title?: string;
  description?: string; // Supports Markdown
  url?: string; // Link when the title is clicked
  timestamp?: ISO8601;
  color?: DiscordColor;
  footer?: EmbedFooter;
  image?: EmbedImage; // Displayed at the bottom
  thumbnail?: EmbedImage; // Displayed at the top-right
  author?: EmbedAuthor; // Displayed above the title
  fields?: EmbedField[]; // Up to 25 fields
};

export type DiscordNotificationPayload = {
  content?: string; // Up to 2000 characters
  embeds?: Embed[]; // Up to 10 embeds
  username?: string; // Override bot username
  avatar_url?: string; // Override bot avatar
  tts?: boolean; // Enable text-to-speech
};
