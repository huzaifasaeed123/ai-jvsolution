/**
 * Typed application configuration, loaded from environment variables.
 * Access via NestJS ConfigService. No hard-coded values live in code.
 */
export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  corsOrigins: string[];
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessTtl: string;
    refreshTtl: string;
  };
  storage: {
    driver: string;
    localPath: string;
  };
  ai: {
    provider: string;
  };
  google: {
    clientId: string;
    clientSecret: string;
    /** Where Google sends the browser back. Must match the console exactly. */
    redirectUri: string;
    /** False when the credentials are absent — the UI hides the button. */
    enabled: boolean;
  };
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
    accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL ?? '7d',
  },
  storage: {
    driver: process.env.STORAGE_DRIVER ?? 'local',
    localPath: process.env.STORAGE_LOCAL_PATH ?? '.storage',
  },
  ai: {
    provider: process.env.AI_PROVIDER ?? 'template',
  },
  google: (() => {
    const clientId = process.env.GOOGLE_CLIENT_ID ?? '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? '';
    return {
      clientId,
      clientSecret,
      // Defaults to the site origin so a deploy only has to set SITE_URL, but
      // the value still has to be registered in the Google console verbatim.
      redirectUri:
        process.env.GOOGLE_REDIRECT_URI ??
        `${process.env.SITE_URL ?? 'http://localhost:3000'}/api/auth/google/callback`,
      // A button that cannot work is worse than no button, so the frontend
      // asks for this and renders nothing when it is false.
      enabled: Boolean(clientId && clientSecret),
    };
  })(),
});
