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
    const nodeEnv = process.env.NODE_ENV ?? 'development';
    const isProd = nodeEnv === 'production';
    const clientId = process.env.GOOGLE_CLIENT_ID ?? '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? '';

    // The origin the browser is actually on. NEXT_PUBLIC_SITE_URL is the name
    // this project already uses for it — same value, set once, read by both
    // apps — so Google sign-in reads that rather than introducing a second
    // variable meaning the same thing. SITE_URL stays accepted as an alias for
    // deployments that already set it.
    //
    // Outside development there is no sane default: guessing localhost is how
    // a production deploy ends up telling Google to send people to a machine
    // that is not the server, and the failure then looks like a Google problem
    // rather than a missing environment variable.
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.SITE_URL ??
      (isProd ? '' : 'http://localhost:3000');

    // Path must match the Google console byte for byte; Google compares the
    // redirect URI as an exact string, not by route equivalence.
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI ??
      (siteUrl ? `${siteUrl}/api/auth/callback/google` : '');

    const configured = Boolean(clientId && clientSecret && redirectUri);

    if (isProd && clientId && clientSecret && !redirectUri) {
      // Fail loudly at boot rather than serving a broken button. A silent
      // fallback here costs an hour of debugging Google's error page.
      throw new Error(
        'Google sign-in has credentials but no callback URL. Set ' +
          'NEXT_PUBLIC_SITE_URL (e.g. https://your-domain.com) on this service, ' +
          'or GOOGLE_REDIRECT_URI to override it.',
      );
    }
    // Never let a localhost callback reach a production deployment: Google
    // would send a real user to their own machine, and the sign-in silently
    // fails for everyone but the developer.
    if (isProd && /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(redirectUri)) {
      throw new Error(
        `Refusing to start: Google redirect URI points at localhost (${redirectUri}) ` +
          'in production. Set NEXT_PUBLIC_SITE_URL to the public origin.',
      );
    }

    return {
      clientId,
      clientSecret,
      redirectUri,
      // A button that cannot work is worse than no button, so the frontend
      // asks for this and renders nothing when it is false.
      enabled: configured,
    };
  })(),
});
