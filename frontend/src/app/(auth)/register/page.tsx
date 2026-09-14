import { isGoogleEnabled } from '@/features/auth/google';
import { RegisterPanel } from './RegisterForm';

export default async function RegisterPage() {
  const googleEnabled = await isGoogleEnabled();
  return <RegisterPanel googleEnabled={googleEnabled} />;
}
