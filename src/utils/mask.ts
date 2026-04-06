export function maskWebhookUrl(value: string): string {
  const discordMasked = maskDiscordWebhookUrl(value);
  if (discordMasked) {
    return discordMasked;
  }

  const slackMasked = maskSlackWebhookUrl(value);
  if (slackMasked) {
    return slackMasked;
  }

  return maskOtherUrl(value);
}

// Discord: https://discord.com/api/webhooks/{webhook.id}/{webhook.token}

const discordWebhookUrlPattern =
  /^(https:\/\/discord\.com\/api\/webhooks)\/(\d+)\/([A-Za-z0-9._-]+)$/;

export function maskDiscordWebhookUrl(value: string): string | undefined {
  const match = value.match(discordWebhookUrlPattern);
  if (!match) {
    return undefined;
  }

  const [_, baseUrl, id, token] = match;
  const maskedToken = maskString(token, 0, 4);
  return `${baseUrl}/${id}/${maskedToken}`;
}

// Slack: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX

const slackWebhookUrlPattern =
  /^(https:\/\/hooks\.slack\.com\/services)\/([A-Z0-9]+)\/([A-Z0-9]+)\/([A-Za-z0-9_-]+)$/;

export function maskSlackWebhookUrl(value: string): string | undefined {
  const match = value.match(slackWebhookUrlPattern);
  if (!match) {
    return undefined;
  }

  const [_, baseUrl, part1, part2, token] = match;
  const maskedToken = maskString(token, 0, 4);
  return `${baseUrl}/${part1}/${part2}/${maskedToken}`;
}

export function maskOtherUrl(value: string): string {
  try {
    const url = new URL(value);

    const maskedPath = maskString(url.pathname.replace(/^\//, ""), 4, 4);

    return `${url.origin}/${maskedPath}`;
  } catch {
    return maskString(value, 0, 4);
  }
}

export function maskString(
  value: string,
  visibleHead: number,
  visibleTail: number,
  maskSymbol: string = "*",
  minimumMaskLength: number = 6,
): string {
  if (value.length <= visibleHead + visibleTail) {
    return maskSymbol.repeat(Math.max(value.length, 6));
  }

  const head = value.slice(0, visibleHead);
  const tail = value.slice(-visibleTail);
  const maskedMiddle = maskSymbol.repeat(
    Math.max(value.length - visibleHead - visibleTail, minimumMaskLength),
  );

  return `${head}${maskedMiddle}${tail}`;
}
