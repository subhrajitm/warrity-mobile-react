import { RegisterForm } from '@/components/auth/register-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register - Warrity',
  description: 'Create your Warrity account.',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <RegisterForm />
    </div>
  );
}
