import { Suspense } from 'react';
import { isGoogleEnabled } from '@/features/auth/google';
import { LoginForm } from './LoginForm';

/**
 * Server wrapper. The "is Google configured" check has to happen here — the
 * form itself is a Client Component and cannot reach the backend directly, and
 * the button must be absent rather than present-but-broken when credentials
 * are missing.
 */
export default async function LoginPage() {
  const googleEnabled = await isGoogleEnabled();
  return (
    <Suspense fallback={null}>
      <LoginForm googleEnabled={googleEnabled} />
    </Suspense>
  );
}
