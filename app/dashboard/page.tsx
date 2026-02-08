'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/main-layout';
import { EventsCarousel } from '@/components/events-carousel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, PenTool } from 'lucide-react';
import FileViewerModal from '@/components/file-viewer-modal';
import { toast } from 'sonner';

export default function Page() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [viewingFile, setViewingFile] = useState<any>(null);
  const isHareesh = (user?.fullName || user?.username || '').toLowerCase().includes('hareesh');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchRequests = async () => {
      const response = await fetch('/api/requests?target=all');
      if (!response.ok) return;
      const data = await response.json();
      const userRequests = (data.requests || []).filter((req: any) => req.createdById === user?.id);
      setAllRequests(data.requests || []);
      setRequests(userRequests);
    };
    fetchRequests();
    const interval = setInterval(fetchRequests, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

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

  const handleSign = async (requestId: string) => {
    const response = await fetch('/api/requests/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, action: 'sign' }),
    });

    if (!response.ok) {
      toast.error('Unable to sign request');
      return;
    }

    toast.success('Signed and forwarded');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome, {user?.fullName || 'User'}!</h1>
          <p className="text-slate-600">Here's your personal dashboard</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white p-6 border-l-4 border-blue-500">
            <p className="text-slate-600 text-sm">Total Requests</p>
            <p className="text-3xl font-bold text-slate-900">{requests.length}</p>
          </Card>
          <Card className="bg-white p-6 border-l-4 border-yellow-500">
            <p className="text-slate-600 text-sm">Pending</p>
            <p className="text-3xl font-bold text-slate-900">
              {requests.filter((r) => r.status === 'pending').length}
            </p>
          </Card>
          <Card className="bg-white p-6 border-l-4 border-green-500">
            <p className="text-slate-600 text-sm">Approved</p>
            <p className="text-3xl font-bold text-slate-900">
              {requests.filter((r) => r.status === 'approved').length}
            </p>
          </Card>
          <Card className="bg-white p-6 border-l-4 border-red-500">
            <p className="text-slate-600 text-sm">Rejected</p>
            <p className="text-3xl font-bold text-slate-900">
              {requests.filter((r) => r.status === 'rejected').length}
            </p>
          </Card>
        </div>

        {isHareesh && (
          <Card className="bg-white p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Signature Queue (Hareesh - Forwarded)</h2>
            {allRequests.filter((req) => req.forwardedTo === 'Hareesh' && req.status === 'forwarded').length === 0 && (
              <p className="text-sm text-slate-600">No forwarded requests for signature.</p>
            )}
            <div className="space-y-3">
              {allRequests
                .filter((req) => req.forwardedTo === 'Hareesh' && req.status === 'forwarded')
                .map((req) => (
                  <div key={req.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{req.title}</p>
                        <p className="text-xs text-slate-500">{req.createdBy}</p>
                      </div>
                      <span className="text-xs text-slate-500">{new Date(req.createdAt).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {req.uploadedFile && (
                        <Button size="sm" variant="outline" onClick={() => setViewingFile(req.uploadedFile)}>
                          View Form
                        </Button>
                      )}
                      {req.uploadedFile && (
                        <Button size="sm" variant="outline" onClick={() => downloadUploadedFile(req)}>
                          <FileDown size={14} className="mr-1" /> Download Form
                        </Button>
                      )}
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleSign(req.id)}>
                        <PenTool size={14} className="mr-1" /> Sign
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        )}

        {/* Approval History (No Balance Exposure) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Approval History</h2>
          {requests.filter((req) => (req.type === 'ta' || req.type === 'proposal') && req.status === 'approved').length === 0 ? (
            <p className="text-slate-600">No approval history yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Amount</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Purpose</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Remarks</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests
                    .filter((req) => (req.type === 'ta' || req.type === 'proposal') && req.status === 'approved')
                    .map((req) => {
                      const isAllowance = req.type === 'ta';
                      const amount = isAllowance
                        ? req.payload?.amount
                        : req.payload?.projectAmount;
                      const purpose = isAllowance
                        ? req.payload?.description
                        : req.payload?.projectTitle;
                      const remarks = isAllowance
                        ? (req.payload?.claimType || req.payload?.billFileName || '')
                        : '';
                      const statusLabel = isAllowance ? 'Debited' : 'Approved';

                      return (
                        <tr key={req.id} className="border-b border-slate-100">
                          <td className="px-4 py-3 text-slate-700">
                            {new Date(req.createdAt).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3 text-slate-700">₹{Number(amount || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-slate-700">{purpose || '-'}</td>
                          <td className="px-4 py-3 text-slate-700">{remarks || '-'}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 text-xs rounded font-medium bg-blue-100 text-blue-800">
                              {statusLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Events Carousel */}
        <EventsCarousel />
      </div>
      <FileViewerModal file={viewingFile} onClose={() => setViewingFile(null)} />
    </MainLayout>
  );
}
