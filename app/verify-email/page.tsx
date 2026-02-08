'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          setStatus('error');
          setMessage('Verification failed. The link may be expired.');
          return;
        }

        setStatus('success');
        setMessage('Email verified successfully! You can now log in.');
      } catch (error) {
        console.error('Verify error:', error);
        setStatus('error');
        setMessage('Verification failed. Please try again.');
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md p-6 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Email Verification</h1>
        <p className="text-slate-600">{message}</p>
        {status !== 'loading' && (
          <Button onClick={() => router.push('/login')} className="w-full">
            Go to Login
          </Button>
        )}
      </Card>
    </div>
  );
}
