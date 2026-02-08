'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfileSetupModal } from '@/components/profile-setup-modal';
import GuestPurposeModal from '@/components/guest-purpose-modal';
import { Sparkles, ArrowRight, Users, FileText, BarChart3 } from 'lucide-react';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      // Guest flow: show guest purpose modal if not completed
      if (user.role === 'guest' && !user.guestFormCompleted) {
        setShowGuestModal(true);
        return;
      }

      // Non-guest first-time users: show profile setup modal only once
      if (user.role !== 'guest' && user.role !== 'admin' && user.role !== 'founder' && !user.isProfileCompleted) {
        setShowProfileModal(true);
      }
    }
  }, [isAuthenticated, router, user]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  const isAdmin = user?.role === 'admin';

  const features = isAdmin
    ? [
        {
          icon: FileText,
          title: 'Leave Management',
          description: 'Approve and manage leave requests',
          href: '/admin/leave-management',
          color: 'blue',
        },
        {
          icon: Users,
          title: 'User Management',
          description: 'Monitor and manage users',
          href: '/admin/user-management',
          color: 'green',
        },
        {
          icon: BarChart3,
          title: 'Analytics & Reports',
          description: 'View detailed system analytics',
          href: '/admin/reports',
          color: 'purple',
        },
      ]
    : [
        {
          icon: FileText,
          title: 'View Forms',
          description: 'Download available forms',
          href: '/forms-gallery',
          color: 'blue',
        },
        {
          icon: Users,
          title: 'Company Info',
          description: 'Learn about our company',
          href: '/company-content',
          color: 'green',
        },
        {
          icon: BarChart3,
          title: 'My Submissions',
          description: 'Track your requests',
          href: '/dashboard',
          color: 'purple',
        },
      ];

  return (
    <MainLayout>
      <div className="max-w-6xl space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
                <Sparkles size={32} />
                Welcome, {user?.fullName || user?.username}!
              </h1>
              <p className="text-blue-100 text-lg">
                {isAdmin
                  ? 'You have full administrative access to the system.'
                  : 'Welcome to Proposal Virtual Intranet Portal.'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">User ID</p>
                <p className="text-2xl font-bold text-slate-900">{user?.id}</p>
              </div>
              <div className="text-4xl text-blue-500">🆔</div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Role</p>
                <p className="text-2xl font-bold text-slate-900 capitalize">
                  {isAdmin ? 'Administrator' : user?.designation || 'User'}
                </p>
              </div>
              <div className="text-4xl text-green-500">👤</div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Email</p>
                <p className="text-lg font-bold text-slate-900 truncate">{user?.email}</p>
              </div>
              <div className="text-4xl text-purple-500">✉️</div>
            </div>
          </Card>
        </div>

        {/* Features Section */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colorClasses = {
                blue: 'bg-blue-50 border-blue-200 hover:border-blue-300',
                green: 'bg-green-50 border-green-200 hover:border-green-300',
                purple: 'bg-purple-50 border-purple-200 hover:border-purple-300',
              };
              const buttonColors = {
                blue: 'bg-blue-600 hover:bg-blue-700',
                green: 'bg-green-600 hover:bg-green-700',
                purple: 'bg-purple-600 hover:bg-purple-700',
              };

              return (
                <Card
                  key={index}
                  className={`p-6 border-2 cursor-pointer transition hover:shadow-lg ${colorClasses[feature.color as keyof typeof colorClasses]}`}
                  onClick={() => router.push(feature.href)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Icon
                      size={32}
                      className={`text-${feature.color}-600`}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 mb-4">{feature.description}</p>
                  <Button
                    onClick={() => router.push(feature.href)}
                    className={`w-full ${buttonColors[feature.color as keyof typeof buttonColors]} text-white flex items-center justify-center gap-2`}
                  >
                    Access <ArrowRight size={18} />
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>

        {/* About Section */}
        <Card className="bg-blue-50 border-l-4 border-blue-600 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-3">ℹ️ About Proposal</h3>
          <p className="text-slate-600 mb-4">
            Proposal is a modern virtual intranet experience for streamlined collaboration.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push('/about-founder')}
            className="text-blue-600 border-blue-300 hover:bg-blue-100"
          >
            Learn More About Us →
          </Button>
        </Card>

        {/* Quick Links */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Links</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => router.push('/forms-gallery')}
              className="p-4 text-center rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition"
            >
              <div className="text-2xl mb-2">📋</div>
              <p className="text-sm font-semibold text-slate-900">Forms</p>
            </button>
            <button
              onClick={() => router.push('/about-founder')}
              className="p-4 text-center rounded-lg bg-white border border-slate-200 hover:border-green-300 hover:bg-green-50 transition"
            >
              <div className="text-2xl mb-2">👨‍💼</div>
              <p className="text-sm font-semibold text-slate-900">Founder</p>
            </button>
            <button
              onClick={() => router.push('/company-content')}
              className="p-4 text-center rounded-lg bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition"
            >
              <div className="text-2xl mb-2">🏢</div>
              <p className="text-sm font-semibold text-slate-900">Company</p>
            </button>
            {isAdmin && (
              <button
                onClick={() => router.push('/admin-dashboard')}
                className="p-4 text-center rounded-lg bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50 transition"
              >
                <div className="text-2xl mb-2">🔐</div>
                <p className="text-sm font-semibold text-slate-900">Admin</p>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Setup Modal */}
      <GuestPurposeModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
      />
      <ProfileSetupModal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
        }}
        mode="setup"
      />
    </MainLayout>
  );
}
