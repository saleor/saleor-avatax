export const appName = "Saleor Avatax";

export const isSsr = typeof window === "undefined";

export type ServerEnvVar = "settingsEncryptionSecret";

export type ServerEnvVars = Record<ServerEnvVar, string>;

export const serverEnvVars: ServerEnvVars = {
  settingsEncryptionSecret: process.env.SETTINGS_ENCRYPTION_SECRET!,
};
