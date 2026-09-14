import configuration from './configuration';

/**
 * The Google callback URL is the one setting where a wrong default is worse
 * than no default. If production silently falls back to localhost, Google
 * sends real users to their own machine and the failure looks like a Google
 * problem rather than a missing environment variable — which is exactly how
 * it presented the first time.
 */
describe('configuration: google redirect URI', () => {
  const original = process.env;

  beforeEach(() => {
    process.env = { ...original };
    delete process.env.SITE_URL;
    delete process.env.GOOGLE_REDIRECT_URI;
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
  });

  afterAll(() => {
    process.env = original;
  });

  it('refuses to start in production when credentials exist but no origin does', () => {
    process.env.NODE_ENV = 'production';
    process.env.GOOGLE_CLIENT_ID = 'id';
    process.env.GOOGLE_CLIENT_SECRET = 'secret';
    expect(() => configuration()).toThrow(/SITE_URL/);
  });

  it('refuses to start in production when the origin is localhost', () => {
    process.env.NODE_ENV = 'production';
    process.env.GOOGLE_CLIENT_ID = 'id';
    process.env.GOOGLE_CLIENT_SECRET = 'secret';
    process.env.SITE_URL = 'http://localhost:3000';
    expect(() => configuration()).toThrow(/localhost/i);
  });

  it('refuses a 127.0.0.1 origin in production too', () => {
    process.env.NODE_ENV = 'production';
    process.env.GOOGLE_CLIENT_ID = 'id';
    process.env.GOOGLE_CLIENT_SECRET = 'secret';
    process.env.SITE_URL = 'http://127.0.0.1:3000';
    expect(() => configuration()).toThrow(/localhost/i);
  });

  it('builds the console-registered path from a real origin', () => {
    process.env.NODE_ENV = 'production';
    process.env.GOOGLE_CLIENT_ID = 'id';
    process.env.GOOGLE_CLIENT_SECRET = 'secret';
    process.env.SITE_URL = 'https://ai-jvsolution.online';
    const c = configuration();
    expect(c.google.redirectUri).toBe(
      'https://ai-jvsolution.online/api/auth/callback/google',
    );
    expect(c.google.enabled).toBe(true);
  });

  it('starts normally in production when Google is simply not configured', () => {
    process.env.NODE_ENV = 'production';
    // No credentials at all — the feature is off, which is not an error.
    expect(() => configuration()).not.toThrow();
    expect(configuration().google.enabled).toBe(false);
  });

  it('still defaults to localhost in development', () => {
    process.env.NODE_ENV = 'development';
    process.env.GOOGLE_CLIENT_ID = 'id';
    process.env.GOOGLE_CLIENT_SECRET = 'secret';
    expect(configuration().google.redirectUri).toBe(
      'http://localhost:3000/api/auth/callback/google',
    );
  });

  it('lets GOOGLE_REDIRECT_URI override the derived value', () => {
    process.env.NODE_ENV = 'production';
    process.env.GOOGLE_CLIENT_ID = 'id';
    process.env.GOOGLE_CLIENT_SECRET = 'secret';
    process.env.GOOGLE_REDIRECT_URI = 'https://other.example/cb/google';
    expect(configuration().google.redirectUri).toBe('https://other.example/cb/google');
  });
});
