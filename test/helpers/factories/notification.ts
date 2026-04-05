import type { Notification } from "@/types/internal/notification";

export function createManualNotification(
  overrides: Partial<Extract<Notification, { source: "manual" }>> = {},
): Extract<Notification, { source: "manual" }> {
  return {
    source: "manual",
    content: {
      type: "standard",
      title: "Manual Title",
      message: "Manual message",
    },
    ...overrides,
  };
}

export function createSystemNotification(
  overrides: Partial<Extract<Notification, { source: "system" }>> = {},
): Extract<Notification, { source: "system" }> {
  return {
    source: "system",
    content: {
      type: "warning",
      title: "System Warning",
      message: "System message",
      color: "#FFAA00",
    },
    ...overrides,
  };
}

export function createGithubNotification(
  overrides: Partial<Extract<Notification, { source: "github" }>> = {},
): Extract<Notification, { source: "github" }> {
  return {
    source: "github",
    content: {
      type: "push",
      action: "push",
      title: "Push to main",
      description: "abc1234: initial commit",
      url: "https://github.com/acme/repo/compare/base...head",
      actor: {
        login: "octocat",
        url: "https://github.com/octocat",
        avatarUrl: "https://avatars.githubusercontent.com/u/1",
      },
      timestamp: "2026-04-04T10:00:00.000Z",
      color: "#1F883D",
      fields: [
        { name: "Action", value: "push", inline: true },
        { name: "Repository", value: "acme/repo\nhttps://github.com/acme/repo", inline: true },
      ],
    },
    ...overrides,
  };
}
