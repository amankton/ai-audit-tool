'use client';

import { AuditForm } from '@/components/AuditForm';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  return (
    <>
      <AuditForm />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </>
  );
}
