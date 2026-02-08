'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password strength validator
  const validatePassword = (pwd: string) => {
    const issues = [];
    if (pwd.length < 8) issues.push('At least 8 characters');
    if (!/[A-Z]/.test(pwd)) issues.push('Uppercase letter');
    if (!/[a-z]/.test(pwd)) issues.push('Lowercase letter');
    if (!/[0-9]/.test(pwd)) issues.push('Number');
    if (!/[^A-Za-z0-9]/.test(pwd)) issues.push('Special character');
    return issues;
  };

  const passwordStrength = validatePassword(formData.password);
  const passwordStrengthPercent = Math.max(0, (5 - passwordStrength.length) * 20);

  // Email validator
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (passwordStrength.length > 0) {
      newErrors.password = `Password must have: ${passwordStrength.join(', ')}`;
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setIsLoading(true);

    try {
      // Call backend API to register user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          fullName: formData.username,
          role: 'user',
          designation: 'Not Set', // Will be set during profile setup
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Registration failed');
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      if (data.message?.toLowerCase().includes('approval')) {
        toast.success(
          'Access request sent to administrator@suryas.in. You will receive an email with a generated username and password once approved.'
        );
      } else {
        toast.success('Registration successful! Redirecting to login...');
      }

      // Redirect to login page
      setTimeout(() => {
        router.push('/login');
      }, 1800);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-lg overflow-hidden">
            <img
              src="https://surya-s.zohosites.in/Remini20220710111603029-removebg.png"
              alt="Proposal Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Proposal</h1>
          <p className="text-blue-200">Create Your Account</p>
        </div>

        {/* Signup Card */}
        <Card className="bg-white/95 backdrop-blur shadow-2xl">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Sign Up</h2>

            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Username *</label>
                <Input
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full border-slate-300 ${errors.username ? 'border-red-500' : ''}`}
                />
                {errors.username && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.username}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full border-slate-300 ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password *</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full border-slate-300 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-600 hover:text-slate-800"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-2 text-xs mb-1">
                      <span className="text-slate-600">Strength:</span>
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            passwordStrengthPercent >= 80
                              ? 'bg-green-500'
                              : passwordStrengthPercent >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${passwordStrengthPercent}%` }}
                        ></div>
                      </div>
                    </div>
                    {passwordStrength.length > 0 && (
                      <p className="text-red-600 text-xs">
                        Missing: {passwordStrength.join(', ')}
                      </p>
                    )}
                  </div>
                )}
                {errors.password && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password *</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full border-slate-300 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-600 hover:text-slate-800"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                    <CheckCircle size={14} /> Passwords match
                  </p>
                )}
                {errors.confirmPassword && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.confirmPassword}
                  </p>
                )}
              </div>


              {/* Terms Checkbox */}
              <div className="flex items-start gap-2 mt-4">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-1 w-4 h-4 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-slate-600">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 mt-6"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 pt-6 border-t border-slate-200 text-center">
              <p className="text-slate-600 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                  Login Here
                </Link>
              </p>
            </div>
          </div>
        </Card>

        {/* Info Box */}
        <div className="mt-6 bg-blue-900/30 border border-blue-400/30 rounded-lg p-4 text-blue-200 text-xs">
          <p className="font-semibold mb-2">ℹ️ Account Requirements:</p>
          <ul className="space-y-1">
            <li>✓ Password must be at least 8 characters</li>
            <li>✓ Include uppercase and lowercase letters</li>
            <li>✓ Include at least one number and special character</li>
            <li>✓ Valid email address required for verification</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
