'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { ProfileSetupModal } from '@/components/profile-setup-modal';

export default function LoginPage() {
  const router = useRouter();
  const { login, guestLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestDesignation, setGuestDesignation] = useState('');
  const [guestCompany, setGuestCompany] = useState('');
  const [guestPurpose, setGuestPurpose] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Handle guest login separately
    if (role === 'guest') {
      setLoading(false);
      setShowGuestModal(true);
      return;
    }

    if (!username || !password) {
      toast.error('Please enter username and password');
      setLoading(false);
      return;
    }

    try {
      // Call backend API for authentication
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Login failed');
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      // Update auth context
      await login(username, password, role);
      
      toast.success(`Welcome, ${data.user.fullName}!`);

      // Redirect to homepage for all users after login
      router.push('/homepage');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      setLoading(false);
    }
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!guestPurpose.trim()) {
      toast.error('Please enter purpose of visit');
      return;
    }

    // Generate a guest username with timestamp to make it unique
    const guestUsername = `${guestName.trim().replace(/\s+/g, '_')}_${Date.now()}`;
    const guestId = `guest-${Date.now()}`;
    const loginTime = new Date().toISOString();

    const logEntry = {
      id: guestId,
      name: guestName.trim(),
      designation: guestDesignation || 'Guest',
      companyName: guestCompany,
      purpose: guestPurpose.trim(),
      email: guestEmail,
      visitDate: new Date().toLocaleDateString('en-IN'),
      visitTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    const existing = localStorage.getItem('guestLogins');
    const parsed = existing ? JSON.parse(existing) : [];
    localStorage.setItem('guestLogins', JSON.stringify([logEntry, ...parsed]));

    // Track guest activity
    try {
      await fetch('/api/guest-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          guestId,
          guestName: guestName.trim(),
          email: guestEmail,
          phone: '',
          loginTime,
        }),
      });
    } catch (error) {
      console.error('Failed to track guest activity:', error);
    }

    // Store guestId in localStorage for logout tracking
    localStorage.setItem('currentGuestId', guestId);
    localStorage.setItem('guestLoginTime', loginTime);

    guestLogin({
      username: guestUsername,
      details: {
        fullName: guestName.trim(),
        email: guestEmail || undefined,
        designation: guestDesignation || 'Guest',
        companyName: guestCompany,
        purposeOfVisit: guestPurpose.trim(),
        guestFormCompleted: true,
      },
    });
    toast.success('Welcome, Guest!');
    setShowGuestModal(false);
    setGuestName('');
    setGuestEmail('');
    setGuestDesignation('');
    setGuestCompany('');
    setGuestPurpose('');
    router.push('/guest-dashboard');
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
                {/* Logo and Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-lg overflow-hidden">
                    <img
                      src="https://surya-s.zohosites.in/Remini20220710111603029-removebg.png"
                      alt="SURYA'S MiB Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">SURYA'S MiB ENTERPRISE</h1>
                  <p className="text-blue-200">Virtual Intranet Portal</p>
                </div>

              {/* Login Card */}
              <Card className="bg-white/95 backdrop-blur shadow-2xl">
          <div className="p-8">
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">Login</h2>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                <Input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border-slate-300"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-slate-300 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-600 hover:text-slate-800"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Login As</label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="w-full border-slate-300">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="founder">Founder</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Login Button */}
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 mt-6"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            {/* Links */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex justify-between items-center text-sm mb-4">
                <a href="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                  Forgot Password?
                </a>
                <button
                  onClick={() => router.push('/signup')}
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  New User? SignUp
                </button>
              </div>

              {/* Guest Login Button */}
              <button
                type="button"
                onClick={() => {
                  setRole('guest');
                  setShowGuestModal(true);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                Login as Guest
              </button>
            </div>
          </div>
        </Card>
        </div>
      </div>

      {/* Guest Modal */}
      <Dialog open={showGuestModal} onOpenChange={setShowGuestModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Guest Access Details</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleGuestSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
              <Input
                placeholder="Enter your full name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full border-slate-300"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full border-slate-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Designation</label>
              <Input
                placeholder="Your current role"
                value={guestDesignation}
                onChange={(e) => setGuestDesignation(e.target.value)}
                className="w-full border-slate-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
              <Input
                placeholder="Company or organization"
                value={guestCompany}
                onChange={(e) => setGuestCompany(e.target.value)}
                className="w-full border-slate-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Purpose of Visit *</label>
              <textarea
                placeholder="Please describe your purpose of visit..."
                value={guestPurpose}
                onChange={(e) => setGuestPurpose(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={4}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowGuestModal(false);
                  setGuestName('');
                  setGuestEmail('');
                  setGuestDesignation('');
                  setGuestCompany('');
                  setGuestRole('');
                  setGuestPurpose('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                Enter as Guest
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Profile Setup Modal */}
      <ProfileSetupModal
        isOpen={showProfileSetup}
        onClose={() => {
          setShowProfileSetup(false);
          router.push('/dashboard');
        }}
      />
    </>
  );
}
