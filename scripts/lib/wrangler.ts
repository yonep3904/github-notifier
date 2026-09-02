// ==== Secret ====

export type WranglerSecretMetadata = {
  name: string;
  type: string;
};

export async function getWranglerSecrets(): Promise<WranglerSecretMetadata[]> {
  const { runCommand } = await import("./io");
  const { stdout } = await runCommand("wrangler", ["secret", "list", "--format", "json"]);
  const metadata: unknown = JSON.parse(stdout);

  if (!isSecretMetadata(metadata)) {
    throw new Error("Unexpected output from `wrangler secret list`");
  }

  return metadata;
}

function isSecretMetadata(value: unknown): value is WranglerSecretMetadata[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as Record<string, unknown>).name === "string" &&
        typeof (item as Record<string, unknown>).type === "string",
    )
  );
}

// ==== Queue ====

export const NOTIFICATION_QUEUE_NAME = "notification-queue";

export async function clearWranglerQueue(): Promise<void> {
  const { runCommand } = await import("./io");
  // wrangler queues purge notification-queue
  await runCommand("wrangler", ["queue", "purge", NOTIFICATION_QUEUE_NAME]);
}

export async function createWranglerQueue(): Promise<void> {
  const { runCommand } = await import("./io");
  // wrangler queues create notification-queue
  await runCommand("wrangler", ["queue", "create", NOTIFICATION_QUEUE_NAME]);
}

// ==== Process Environment ====

export const SECRET_PRESENT_VALUE = "__SECRET_PRESENT__";

export type ProcessEnv = Record<string, string | undefined>;

export async function createProcessEnv(): Promise<ProcessEnv> {
  const env = { ...process.env };
  const secrets = await getWranglerSecrets();
  for (const secret of secrets) {
    env[secret.name] = `${SECRET_PRESENT_VALUE}${secret.name}`;
  }

  return env;
}

export function getSecret(value: string): string | undefined {
  if (value.startsWith(SECRET_PRESENT_VALUE)) {
    return value.slice(SECRET_PRESENT_VALUE.length);
  } else {
    return undefined;
  }
}
