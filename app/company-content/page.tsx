'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/main-layout';
import { Card } from '@/components/ui/card';
import { Calendar, Trophy, Briefcase, Clock } from 'lucide-react';

export default function CompanyContentPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <MainLayout>
      <div className="max-w-6xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">🏢 Company Information & Content</h1>
          <p className="text-slate-600">Updates on company achievements, events, and policies</p>
        </div>

        {/* Previously Conducted Events */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 border-l-4 border-blue-600">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">📅 Previously Conducted Events</h2>
              <div className="bg-white p-4 rounded-lg border-2 border-blue-200 mt-4">
                <p className="text-slate-700 font-semibold mb-2">Status: Under Progress</p>
                <p className="text-slate-600">
                  🔄 Content to be updated – LinkedIn posts and event highlights to be shared by Technical Team
                </p>
                <p className="text-sm text-blue-600 font-semibold mt-3">Expected Update: Before 05-02-2025</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Achievements & Company Growth */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 border-l-4 border-green-600">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Trophy size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">🏆 Achievements & Company Growth</h2>
              <div className="bg-white p-4 rounded-lg border-2 border-green-200 mt-4">
                <p className="text-slate-700 font-semibold mb-2">Status: Pending</p>
                <p className="text-slate-600">
                  📊 Milestones, awards, certifications, and company growth metrics to be documented and shared
                </p>
                <p className="text-sm text-green-600 font-semibold mt-3">Will be updated with official data</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Organizational Policies */}
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 p-8 border-l-4 border-orange-600">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Briefcase size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">📋 Organizational Policies</h2>
              <div className="bg-white p-4 rounded-lg border-2 border-orange-200 mt-4">
                <p className="text-slate-700 font-semibold mb-2">Status: Under Progress</p>
                <p className="text-slate-600">
                  📑 Employee handbook, conduct policies, and guidelines being finalized
                </p>
                <p className="text-sm text-orange-600 font-semibold mt-3">Expected Update: 31-01-2026</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Key Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Timeline */}
          <Card className="bg-white p-6 border-l-4 border-purple-500">
            <div className="flex items-center gap-3 mb-4">
              <Clock size={24} className="text-purple-600" />
              <h3 className="text-lg font-bold text-slate-900">Update Timeline</h3>
            </div>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="pb-3 border-b border-slate-200">
                <p className="font-semibold text-slate-900">Events: 05-02-2025</p>
                <p className="text-xs text-slate-600">LinkedIn posts and event details</p>
              </div>
              <div className="pb-3 border-b border-slate-200">
                <p className="font-semibold text-slate-900">Policies: 31-01-2026</p>
                <p className="text-xs text-slate-600">Company guidelines and handbook</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Achievements: Ongoing</p>
                <p className="text-xs text-slate-600">Real-time updates</p>
              </div>
            </div>
          </Card>

          {/* Progress Status */}
          <Card className="bg-white p-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-bold text-slate-900 mb-4">📊 Completion Status</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-700">Events</span>
                  <span className="text-xs text-slate-600">60%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '60%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-700">Policies</span>
                  <span className="text-xs text-slate-600">70%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '70%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-700">Achievements</span>
                  <span className="text-xs text-slate-600">30%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{width: '30%'}}></div>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact for Details */}
          <Card className="bg-white p-6 border-l-4 border-green-500">
            <h3 className="text-lg font-bold text-slate-900 mb-4">📞 Contact for Details</h3>
            <div className="space-y-3 text-sm text-slate-700">
              <div>
                <p className="font-semibold text-slate-900">Technical Team</p>
                <p className="text-slate-600">technicalteam@suryas.in</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Administrator</p>
                <p className="text-slate-600">administrator@suryas.in</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Proprietor</p>
                <p className="text-slate-600">proprietor@suryas.in</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Information Card */}
        <Card className="bg-blue-50 border-l-4 border-blue-600 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-3">ℹ️ About This Section</h3>
          <p className="text-slate-700 mb-4">
            This section contains placeholder content for upcoming company information and official announcements. 
            All content will be updated by the respective departments on their scheduled timelines.
          </p>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>✓ Events and webinars hosted by the company</li>
            <li>✓ Major achievements and milestones reached</li>
            <li>✓ Official company policies and guidelines</li>
            <li>✓ Regular updates and announcements</li>
          </ul>
        </Card>
      </div>
    </MainLayout>
  );
}
