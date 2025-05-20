
"use client";

import { WarrantyForm } from '@/components/warranties/warranty-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useQueryClient } from '@tanstack/react-query';
// import type { Metadata } from 'next'; // Metadata not used in client component

// Metadata can't be dynamic in client components directly, but we can set a generic one.
// For dynamic metadata based on client-side state, you'd handle it differently (e.g. document.title).
// export const metadata: Metadata = {
//   title: 'Add New Warranty - Warrity',
//   description: 'Add a new warranty to your Warrity.',
// };
// This page must be a client component because WarrantyForm is one.
// So we can't export metadata object directly.

export default function AddWarrantyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // This effect would be for dynamic title setting if needed, but metadata API preferred for static.
  // useEffect(() => {
  //   document.title = 'Add New Warranty - Warrity';
  // }, []);

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboardData', user?._id] });
    router.push('/dashboard');
  };

  return (
    <div className="container mx-auto py-8">
      <WarrantyForm onSubmitSuccess={handleSuccess} />
    </div>
  );
}
