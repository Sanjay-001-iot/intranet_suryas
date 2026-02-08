'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { Camera, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'setup' | 'edit';
}

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ isOpen, onClose, mode = 'setup' }) => {
  const { user, updateProfile } = useAuth();
  const [previewImage, setPreviewImage] = useState<string>(user?.profilePhoto || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [userRole, setUserRole] = useState(user?.designation?.toLowerCase() || 'intern');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [username, setUsername] = useState(user?.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEditMode = mode === 'edit';

  useEffect(() => {
    if (!isOpen || !user) return;
    setPreviewImage(user.profilePhoto || '');
    setPhone(user.phone || '');
    setUserRole(user.designation?.toLowerCase() || 'intern');
    setFullName(user.fullName || '');
    setEmail(user.email || '');
    setUsername(user.username || '');
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  }, [isOpen, user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isEditMode && !previewImage) {
        toast.error('Please upload a profile picture');
        setLoading(false);
        return;
      }

      if (!isEditMode && !userRole) {
        toast.error('Please select your role');
        setLoading(false);
        return;
      }

      if (!phone.trim()) {
        toast.error('Please enter your phone number');
        setLoading(false);
        return;
      }

      if (isEditMode) {
        if (!fullName.trim()) {
          toast.error('Please enter your full name');
          setLoading(false);
          return;
        }

        if (!email.trim()) {
          toast.error('Please enter your email');
          setLoading(false);
          return;
        }

        if (!username.trim()) {
          toast.error('Please enter your username');
          setLoading(false);
          return;
        }

        if (newPassword || confirmPassword) {
          if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            setLoading(false);
            return;
          }
          if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            setLoading(false);
            return;
          }
        }
      }

      const updatePayload: any = {
        profilePhoto: previewImage || user?.profilePhoto,
        profilePictureUploaded: user?.profilePictureUploaded || !!previewImage,
      };

      if (userRole) {
        updatePayload.designation = userRole.charAt(0).toUpperCase() + userRole.slice(1);
      }

      if (isEditMode) {
        updatePayload.fullName = fullName.trim();
        updatePayload.email = email.trim();
        updatePayload.username = username.trim();
        updatePayload.phone = phone.trim();
        if (newPassword) {
          updatePayload.password = newPassword;
        }
      } else {
        updatePayload.phone = phone.trim();
        updatePayload.isProfileCompleted = true;
        updatePayload.profileCompletedAt = new Date().toISOString();
      }

      await updateProfile(updatePayload);

      toast.success(isEditMode ? 'Profile updated successfully!' : 'Profile updated successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isEditMode) return;
      if (!open && isEditMode) onClose();
    }}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto" onInteractOutside={(e) => {
        if (!isEditMode) {
          e.preventDefault();
        }
      }}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-600">
            {isEditMode ? 'Edit Profile' : '✨ Complete Your Profile'}
          </DialogTitle>
        </DialogHeader>

        {!isEditMode && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800 mb-2">
            <p className="font-semibold">ℹ️ Profile completion required</p>
            <p className="text-blue-700 mt-1">Please complete your profile before accessing the dashboard.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center space-y-4">
            <label className="relative w-32 h-32 rounded-full border-4 border-blue-200 overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer group">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 0%' }}
                />
              ) : (
                <Camera className="w-12 h-12 text-slate-400" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold">
                Upload
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            <p className="text-xs text-slate-500">
              Click the circle to upload (JPG, PNG, GIF — Max 5MB)
            </p>
          </div>

          {isEditMode && (
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full"
              />
            </div>
          )}

          {isEditMode && (
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full"
              />
            </div>
          )}

          {isEditMode && (
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full"
              />
            </div>
          )}

          {/* Phone Number */}
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">
              Phone Number *
            </Label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full"
            />
          </div>

          {/* Role Selection */}
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">
              Your Role {isEditMode ? '(Optional)' : '*'}
            </Label>
            <Select value={userRole} onValueChange={setUserRole}>
              <SelectTrigger className="w-full border-slate-300">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="intern">Intern</SelectItem>
                <SelectItem value="freelancer">Freelancer</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">
              Select your role within the organization
            </p>
          </div>

          {isEditMode && (
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">
                New Password (Optional)
              </Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {isEditMode && (
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            {isEditMode && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Complete Profile'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
