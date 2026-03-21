'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DriverIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();

          if (data.user.role !== 'driver') {
            router.push('/home');
            return;
          }

          const statusRes = await fetch('/api/driver/verification/status');
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            if (statusData.document?.verification_status === 'approved') {
              router.push('/driver/dashboard');
            } else {
              router.push('/driver/verification');
            }
          } else {
            router.push('/driver/verification');
          }
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Error:', err);
        router.push('/login');
      }
    };

    checkStatus();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
    </div>
  );
}
