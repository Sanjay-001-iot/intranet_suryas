'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/main-layout';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function InternalRevenuePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  // Only Admins can access this
  if (user?.role !== 'admin') {
    return (
      <MainLayout>
        <div className="max-w-2xl">
          <Card className="bg-red-50 border-2 border-red-200 p-8 flex items-center gap-4">
            <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-bold text-red-900 mb-2">Access Restricted</h2>
              <p className="text-red-800">
                This section is only available to administrators. You don't have permission to access this page.
              </p>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Internal Revenue</h1>
        <p className="text-slate-600 mb-6">Financial tracking and revenue data (Admin only)</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white p-6 border-l-4 border-green-500">
            <p className="text-slate-600 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold text-slate-900">₹12,50,000</p>
            <p className="text-xs text-green-600 mt-2">↑ 15% from last month</p>
          </Card>

          <Card className="bg-white p-6 border-l-4 border-blue-500">
            <p className="text-slate-600 text-sm">Total Expenses</p>
            <p className="text-3xl font-bold text-slate-900">₹5,80,000</p>
            <p className="text-xs text-slate-600 mt-2">Operating costs</p>
          </Card>

          <Card className="bg-white p-6 border-l-4 border-purple-500">
            <p className="text-slate-600 text-sm">Net Profit</p>
            <p className="text-3xl font-bold text-slate-900">₹6,70,000</p>
            <p className="text-xs text-purple-600 mt-2">53.6% margin</p>
          </Card>

          <Card className="bg-white p-6 border-l-4 border-orange-500">
            <p className="text-slate-600 text-sm">Active Projects</p>
            <p className="text-3xl font-bold text-slate-900">12</p>
            <p className="text-xs text-slate-600 mt-2">Total value: ₹45L</p>
          </Card>
        </div>

        {/* Revenue Breakdown */}
        <Card className="bg-white p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Revenue Breakdown by Category</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">PCB Services</span>
                <span className="text-sm font-semibold text-slate-900">₹6,50,000 (52%)</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '52%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">Solar Solutions</span>
                <span className="text-sm font-semibold text-slate-900">₹3,75,000 (30%)</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">Project Services</span>
                <span className="text-sm font-semibold text-slate-900">₹1,87,500 (15%)</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">Consulting</span>
                <span className="text-sm font-semibold text-slate-900">₹37,500 (3%)</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '3%' }}></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Expense Details */}
        <Card className="bg-white p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Expense Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-900">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-900">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-900">Percentage</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-900">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-900">Staff & Salaries</td>
                  <td className="px-4 py-3 text-slate-900">₹2,50,000</td>
                  <td className="px-4 py-3 text-slate-900">43%</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Paid</span></td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-900">Equipment & Software</td>
                  <td className="px-4 py-3 text-slate-900">₹1,45,000</td>
                  <td className="px-4 py-3 text-slate-900">25%</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Paid</span></td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-900">Office & Utilities</td>
                  <td className="px-4 py-3 text-slate-900">₹1,00,000</td>
                  <td className="px-4 py-3 text-slate-900">17%</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Pending</span></td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-900">Travel & Logistics</td>
                  <td className="px-4 py-3 text-slate-900">₹60,000</td>
                  <td className="px-4 py-3 text-slate-900">10%</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Paid</span></td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-900">Marketing & Admin</td>
                  <td className="px-4 py-3 text-slate-900">₹25,000</td>
                  <td className="px-4 py-3 text-slate-900">5%</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Paid</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
