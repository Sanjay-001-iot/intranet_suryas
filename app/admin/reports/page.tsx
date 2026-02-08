'use client';

import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '@/components/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Download, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import FileViewerModal from '@/components/file-viewer-modal';

export default function AdminReports() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [viewingFile, setViewingFile] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchRequests = async () => {
      const response = await fetch('/api/requests?target=all');
      if (!response.ok) return;
      const data = await response.json();
      setRequests(data.requests || []);
    };

    fetchRequests();
    const interval = setInterval(fetchRequests, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, router]);

  const monthOptions = useMemo(() => {
    const months = new Set<string>();
    requests.forEach((req) => {
      const date = new Date(req.createdAt);
      if (!Number.isNaN(date.getTime())) {
        months.add(date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }));
      }
    });
    const list = Array.from(months);
    return list.length ? list : [new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })];
  }, [requests]);

  useEffect(() => {
    if (!selectedMonth && monthOptions.length) {
      setSelectedMonth(monthOptions[0]);
    }
  }, [selectedMonth, monthOptions]);

  const monthlyRequests = useMemo(() => {
    if (!selectedMonth) return requests;
    return requests.filter((req) => {
      const date = new Date(req.createdAt);
      if (Number.isNaN(date.getTime())) return false;
      const label = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      return label === selectedMonth;
    });
  }, [requests, selectedMonth]);

  const leaveStats = useMemo(() => {
    const items = monthlyRequests.filter((r) => r.type === 'leave');
    return {
      pending: items.filter((r) => r.status === 'pending').length,
      approved: items.filter((r) => r.status === 'approved').length,
      rejected: items.filter((r) => r.status === 'rejected').length,
      byType: items.reduce((acc: Record<string, number>, item) => {
        const type = item.payload?.leaveType || 'other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}),
    };
  }, [monthlyRequests]);

  const taStats = useMemo(() => {
    const items = monthlyRequests.filter((r) => r.type === 'ta');
    const totalAmount = items.reduce((sum, item) => sum + Number(item.payload?.amount || 0), 0);
    return {
      pending: items.filter((r) => r.status === 'pending').length,
      approved: items.filter((r) => r.status === 'approved').length,
      rejected: items.filter((r) => r.status === 'rejected').length,
      totalAmount,
      averageAmount: items.length ? totalAmount / items.length : 0,
    };
  }, [monthlyRequests]);

  const projectStats = useMemo(() => {
    const items = monthlyRequests.filter((r) => r.type === 'proposal');
    const totalBudget = items.reduce((sum, item) => sum + Number(item.payload?.projectAmount || 0), 0);
    return {
      submitted: items.length,
      approved: items.filter((r) => r.status === 'approved').length,
      rejected: items.filter((r) => r.status === 'rejected').length,
      pending: items.filter((r) => r.status === 'pending').length,
      totalBudget,
    };
  }, [monthlyRequests]);

  const reportItems = monthlyRequests.filter((r) => r.type === 'report');

  const downloadUploadedFile = (request: any) => {
    if (!request.uploadedFile) {
      toast.error('No file available');
      return;
    }
    const link = document.createElement('a');
    link.href = request.uploadedFile.base64;
    link.download = request.uploadedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <MainLayout>
      <div className="max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">System Reports & Analytics</h1>
          <p className="text-slate-600">Live request stats and report downloads</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-blue-500" />
            <select
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2" onClick={() => window.print()}>
              <Download size={18} /> Export Summary
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Leave Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-yellow-50 p-6 border-l-4 border-yellow-500">
              <p className="text-sm text-slate-600 mb-1">Pending Requests</p>
              <p className="text-3xl font-bold text-yellow-600">{leaveStats.pending}</p>
              <p className="text-xs text-slate-500 mt-2">Awaiting approval</p>
            </Card>
            <Card className="bg-green-50 p-6 border-l-4 border-green-500">
              <p className="text-sm text-slate-600 mb-1">Approved Leaves</p>
              <p className="text-3xl font-bold text-green-600">{leaveStats.approved}</p>
            </Card>
            <Card className="bg-red-50 p-6 border-l-4 border-red-500">
              <p className="text-sm text-slate-600 mb-1">Rejected</p>
              <p className="text-3xl font-bold text-red-600">{leaveStats.rejected}</p>
            </Card>
            <Card className="bg-purple-50 p-6 border-l-4 border-purple-500">
              <p className="text-sm text-slate-600 mb-1">By Type</p>
              <div className="text-xs mt-3 space-y-1">
                {Object.keys(leaveStats.byType).length === 0 && (
                  <p className="text-slate-700">No data</p>
                )}
                {Object.entries(leaveStats.byType).map(([type, count]) => (
                  <p key={type} className="text-slate-700">{type}: {count}</p>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Allowance Claims Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-yellow-50 p-6 border-l-4 border-yellow-500">
              <p className="text-sm text-slate-600 mb-1">Pending Claims</p>
              <p className="text-3xl font-bold text-yellow-600">{taStats.pending}</p>
            </Card>
            <Card className="bg-green-50 p-6 border-l-4 border-green-500">
              <p className="text-sm text-slate-600 mb-1">Approved Claims</p>
              <p className="text-3xl font-bold text-green-600">{taStats.approved}</p>
              <p className="text-xs text-slate-500 mt-2">₹{taStats.totalAmount.toLocaleString()} total</p>
            </Card>
            <Card className="bg-red-50 p-6 border-l-4 border-red-500">
              <p className="text-sm text-slate-600 mb-1">Rejected Claims</p>
              <p className="text-3xl font-bold text-red-600">{taStats.rejected}</p>
            </Card>
            <Card className="bg-blue-50 p-6 border-l-4 border-blue-500">
              <p className="text-sm text-slate-600 mb-1">Average Amount</p>
              <p className="text-3xl font-bold text-blue-600">₹{Math.round(taStats.averageAmount).toLocaleString()}</p>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Project Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-blue-50 p-6 border-l-4 border-blue-500">
              <p className="text-sm text-slate-600 mb-1">Total Submitted</p>
              <p className="text-3xl font-bold text-blue-600">{projectStats.submitted}</p>
            </Card>
            <Card className="bg-green-50 p-6 border-l-4 border-green-500">
              <p className="text-sm text-slate-600 mb-1">Approved</p>
              <p className="text-3xl font-bold text-green-600">{projectStats.approved}</p>
            </Card>
            <Card className="bg-yellow-50 p-6 border-l-4 border-yellow-500">
              <p className="text-sm text-slate-600 mb-1">Under Review</p>
              <p className="text-3xl font-bold text-yellow-600">{projectStats.pending}</p>
            </Card>
            <Card className="bg-purple-50 p-6 border-l-4 border-purple-500">
              <p className="text-sm text-slate-600 mb-1">Total Budget</p>
              <p className="text-3xl font-bold text-purple-600">₹{projectStats.totalBudget.toLocaleString()}</p>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Weekly/Monthly Reports</h2>
          {reportItems.length === 0 ? (
            <Card className="p-6 text-slate-600">No reports submitted.</Card>
          ) : (
            <div className="space-y-3">
              {reportItems.map((req) => (
                <Card key={req.id} className="bg-white p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{req.payload?.reportType} report</p>
                      <p className="text-xs text-slate-500">{req.createdBy}</p>
                    </div>
                    <span className="text-xs text-slate-500">{new Date(req.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-sm text-slate-700 mt-2">{req.payload?.reportContent}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {req.uploadedFile && (
                      <Button size="sm" variant="outline" onClick={() => setViewingFile(req.uploadedFile)}>
                        View PDF
                      </Button>
                    )}
                    {req.uploadedFile && (
                      <Button size="sm" variant="outline" onClick={() => downloadUploadedFile(req)}>
                        <FileDown size={14} className="mr-1" /> Download PDF
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <FileViewerModal file={viewingFile} onClose={() => setViewingFile(null)} />
    </MainLayout>
  );
}
