"use client";

import { ProfileForm } from '@/components/profile/profile-form';

export default function ProfilePage() {
  return (
    <div className="px-4 pt-2">
      <ProfileForm />
    </div>
  );
}

// Cannot use generateMetadata in a client component.
// export const metadata: Metadata = {
//   title: 'Profile Settings - Warrity',
//   description: 'Manage your Warrity account settings.',
// };
