/**
 * Types used by Slack Incoming Webhooks and Block Kit messages.
 * Ref: https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks
 */

export type SlackPlainText = {
  type: "plain_text";
  text: string;
  emoji?: boolean;
};

export type SlackMarkdownText = {
  type: "mrkdwn";
  text: string;
  verbatim?: boolean;
};

export type SlackText = SlackPlainText | SlackMarkdownText;

export type SlackHeaderBlock = {
  type: "header";
  text: SlackPlainText;
};

export type SlackSectionBlock = {
  type: "section";
  text?: SlackText;
  fields?: SlackText[];
};

export type SlackContextBlock = {
  type: "context";
  elements: SlackText[];
};

export type SlackBlock = SlackHeaderBlock | SlackSectionBlock | SlackContextBlock;

export type SlackAttachment = {
  color?: string;
  blocks: SlackBlock[];
};

export type SlackNotificationPayload = {
  /** Plain-text fallback used by notifications and assistive technology. */
  text: string;
  blocks?: SlackBlock[];
  attachments?: SlackAttachment[];
};
