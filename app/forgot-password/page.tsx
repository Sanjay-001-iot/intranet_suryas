'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        toast.error('Unable to send reset link');
        return;
      }
      
      toast.success('Reset link sent to your email');
      
      // In development mode, show the reset link
      if (data.resetUrl) {
        setResetLink(data.resetUrl);
      } else {
        // In production, redirect to login after 2 seconds
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  if (resetLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md p-6 space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">Password Reset Link</h1>
          <p className="text-slate-600">
            (Development Mode) Click the link below to reset your password:
          </p>
          <div className="bg-blue-50 p-3 rounded border border-blue-200 break-all text-sm">
            <Link href={resetLink} className="text-blue-600 hover:text-blue-800 underline">
              {resetLink}
            </Link>
          </div>
          <Button onClick={() => router.push('/login')} className="w-full">
            Back to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Forgot Password</h1>
        <p className="text-slate-600">Enter your email to receive a reset link.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
