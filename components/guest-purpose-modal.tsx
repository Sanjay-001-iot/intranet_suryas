"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface GuestPurposeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuestPurposeModal({ isOpen, onClose }: GuestPurposeModalProps) {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.fullName || '');
  const [designation, setDesignation] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name.trim()) {
      toast.error('Please enter your name');
      setLoading(false);
      return;
    }

    if (!purpose.trim()) {
      toast.error('Please describe the purpose of your visit');
      setLoading(false);
      return;
    }

    try {
      const logEntry = {
        id: `guest-${Date.now()}`,
        name,
        designation: designation || 'Guest',
        companyName,
        purpose,
        visitDate: new Date().toLocaleDateString('en-IN'),
        visitTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };

      const existing = localStorage.getItem('guestLogins');
      const parsed = existing ? JSON.parse(existing) : [];
      localStorage.setItem('guestLogins', JSON.stringify([logEntry, ...parsed]));

      // Save guest details to profile and mark guest form completed
      await updateProfile({
        fullName: name,
        designation: designation || 'Guest',
        companyName,
        purposeOfVisit: purpose,
        profilePhoto: '/default-admin.svg',
        profilePictureUploaded: true,
        guestFormCompleted: true,
      });

      toast.success('Thanks — your details have been saved');
      onClose();
    } catch (err) {
      toast.error('Failed to save details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Welcome, Guest</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-slate-600 mb-4">Please tell us a bit about yourself and the purpose of your visit.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
          </div>

          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">Designation</Label>
            <Input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g., Manager" />
          </div>

          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">Company Name</Label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company name" />
          </div>

          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">Purpose of Visit *</Label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full border rounded p-2 min-h-[100px]"
              placeholder="Briefly describe why you are visiting"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={loading}>{loading ? 'Saving...' : 'Submit & Continue'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
