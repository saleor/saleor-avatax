export const appName = "Saleor Avatax";

export const DEFAULT_TAX_CODE = "O9999999"

export const isSsr = typeof window === "undefined";

export type ServerEnvVar = "settingsEncryptionSecret";

export type ServerEnvVars = Record<ServerEnvVar, string>;

export const serverEnvVars: ServerEnvVars = {
  settingsEncryptionSecret: process.env.SETTINGS_ENCRYPTION_SECRET!,
};
