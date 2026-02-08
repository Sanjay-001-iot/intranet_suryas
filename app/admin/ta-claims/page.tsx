'use client';

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Search, Filter, DollarSign, FileDown, Eye, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import FileViewerModal from '@/components/file-viewer-modal';
import { exportToExcel, formatExportDate, getStatusLabel } from '@/lib/excel-export';

export default function TAClaims() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [taClaims, setTAClaims] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [viewingFile, setViewingFile] = useState<any>(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchRequests = async () => {
      const response = await fetch('/api/requests?target=all');
      if (!response.ok) return;
      const data = await response.json();
      const claims = (data.requests || []).filter((req: any) => req.type === 'ta');
      setTAClaims(claims);
    };

    fetchRequests();
    const interval = setInterval(fetchRequests, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, router]);

  const handleApprove = async (id: string) => {
    const response = await fetch('/api/requests/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: id, action: 'approve' }),
    });

    if (!response.ok) {
      toast.error('Unable to approve claim');
      return;
    }

    toast.success('✅ Allowance claim approved!');
  };

  const handleReject = async (id: string) => {
    const response = await fetch('/api/requests/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: id, action: 'reject' }),
    });

    if (!response.ok) {
      toast.error('❌ Allowance claim rejected!');
      return;
    }

    toast.error('❌ Allowance claim rejected!');
  };

  const downloadUploadedFile = (claim: any) => {
    if (!claim.uploadedFile) {
      toast.error('No file available');
      return;
    }
    const link = document.createElement('a');
    link.href = claim.uploadedFile.base64;
    link.download = claim.uploadedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadRequestPdf = (claim: any) => {
    const payload = claim.payload || {};
    const html = `
      <html>
        <head>
          <title>${claim.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; }
            h1 { font-size: 20px; margin-bottom: 8px; }
            .meta { font-size: 12px; color: #475569; margin-bottom: 16px; }
            .line { margin: 6px 0; }
          </style>
        </head>
        <body>
          <h1>${claim.title}</h1>
          <div class="meta">Submitted by ${claim.createdBy} • ${new Date(claim.createdAt).toLocaleString('en-IN')}</div>
          <div class="line">Amount: ₹${payload.amount}</div>
          <div class="line">Description: ${payload.description}</div>
          <div class="line">Status: ${claim.status}</div>
          <div class="line">Receipt: ${payload.billFileName || 'Not provided'}</div>
        </body>
      </html>
    `;

    const pdfWindow = window.open('', '_blank');
    if (!pdfWindow) return;
    pdfWindow.document.write(html);
    pdfWindow.document.close();
    pdfWindow.focus();
    setTimeout(() => pdfWindow.print(), 300);
  };

  const viewUploadedFile = (claim: any) => {
    if (!claim.uploadedFile) {
      toast.error('No file available');
      return;
    }
    setViewingFile(claim.uploadedFile);
  };

  const filteredClaims = taClaims
    .filter((claim) => filterStatus === 'all' || claim.status === filterStatus)
    .filter(
      (claim) =>
        claim.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (claim.payload?.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getTotalAmount = () => {
    return filteredClaims.reduce((sum, claim) => sum + Number(claim.payload?.amount || 0), 0);
  };

  const handleExportToExcel = () => {
    try {
      if (filteredClaims.length === 0) {
        toast.error('No data to export');
        return;
      }

      const exportData = filteredClaims.map((claim) => ({
        Username: claim.createdBy,
        RequestType: 'Allowance Claim',
        Reason: claim.payload?.description || '',
        Status: getStatusLabel(claim.status),
        AppliedDate: formatExportDate(claim.createdAt),
      }));

      const columns = [
        { key: 'Username', header: 'Username' },
        { key: 'RequestType', header: 'Request Type' },
        { key: 'Reason', header: 'Reason' },
        { key: 'Status', header: 'Status' },
        { key: 'AppliedDate', header: 'Applied Date' },
      ];

      const dateStamp = new Date().toISOString().split('T')[0];
      exportToExcel(exportData, columns, `TA_Claims_${dateStamp}`);
      toast.success('✓ Allowance claims exported to Excel');
    } catch (error) {
      toast.error('Failed to export data');
      console.error(error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />;
      case 'approved':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">💰 Allowance Claims Management</h1>
          <p className="text-slate-600">Review and approve/reject travel allowance claims</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by employee or description..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Filter size={20} className="mt-2 text-slate-500" />
            <select
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Claims</option>
              <option value="pending">Pending Only</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <Button
            onClick={handleExportToExcel}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={taClaims.length === 0}
          >
            <Download size={18} className="mr-2" />
            Download Excel
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-yellow-50 p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-slate-600">Pending Claims</p>
            <p className="text-2xl font-bold text-yellow-600">
              {taClaims.filter((r) => r.status === 'pending').length}
            </p>
          </Card>
          <Card className="bg-green-50 p-4 border-l-4 border-green-500">
            <p className="text-sm text-slate-600">Approved</p>
            <p className="text-2xl font-bold text-green-600">
              {taClaims.filter((r) => r.status === 'approved').length}
            </p>
          </Card>
          <Card className="bg-red-50 p-4 border-l-4 border-red-500">
            <p className="text-sm text-slate-600">Rejected</p>
            <p className="text-2xl font-bold text-red-600">
              {taClaims.filter((r) => r.status === 'rejected').length}
            </p>
          </Card>
          <Card className="bg-purple-50 p-4 border-l-4 border-purple-500">
            <p className="text-sm text-slate-600">Total Amount</p>
            <p className="text-2xl font-bold text-purple-600">₹{getTotalAmount().toLocaleString()}</p>
          </Card>
          <Card className="bg-blue-50 p-4 border-l-4 border-blue-500">
            <p className="text-sm text-slate-600">Total Claims</p>
            <p className="text-2xl font-bold text-blue-600">{taClaims.length}</p>
          </Card>
        </div>

        <div className="space-y-4">
          {filteredClaims.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-slate-600">No allowance claims found</p>
            </Card>
          ) : (
            filteredClaims.map((claim) => (
              <Card
                key={claim.id}
                className={`p-6 border-l-4 ${
                  claim.status === 'pending'
                    ? 'border-yellow-500 bg-yellow-50'
                    : claim.status === 'approved'
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">EMPLOYEE</p>
                    <p className="text-sm font-semibold text-slate-900">{claim.createdBy}</p>
                    <p className="text-xs text-slate-500">{claim.createdByDesignation || 'Employee'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-600 mb-1">AMOUNT</p>
                    <div className="flex items-center gap-1">
                      <DollarSign size={18} className="text-blue-600" />
                      <p className="text-xl font-bold text-slate-900">₹{Number(claim.payload?.amount || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-xs text-slate-600 mb-1">DESCRIPTION</p>
                    <p className="text-sm text-slate-700">{claim.payload?.description}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-slate-500">
                        📄 Form: {claim.payload?.filledFormFileName || 'Not uploaded'}
                      </p>
                      <p className="text-xs text-slate-500">
                        📎 Proofs: {claim.payload?.billFileName || 'None'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-600 mb-1">STATUS</p>
                    <div className="flex items-center gap-2 mb-3">
                      {getStatusIcon(claim.status)}
                      <span
                        className={`text-sm font-semibold ${
                          claim.status === 'pending'
                            ? 'text-yellow-600'
                            : claim.status === 'approved'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{new Date(claim.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>

                {claim.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <textarea
                          placeholder="Add a review note or comment..."
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={2}
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2 flex-col justify-end">
                        <Button size="sm" variant="outline" className="w-full" onClick={() => setSelectedClaim(claim)}>
                          <Eye size={14} className="mr-1" /> View
                        </Button>
                        {claim.uploadedFile && (
                          <Button size="sm" variant="outline" className="w-full" onClick={() => viewUploadedFile(claim)}>
                            <FileDown size={14} className="mr-1" /> View Form
                          </Button>
                        )}
                        {claim.uploadedFile && (
                          <Button size="sm" variant="outline" className="w-full" onClick={() => downloadUploadedFile(claim)}>
                            <FileDown size={14} className="mr-1" /> Download Form
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="w-full" onClick={() => downloadRequestPdf(claim)}>
                          <FileDown size={14} className="mr-1" /> Summary
                        </Button>
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white w-full" onClick={() => handleApprove(claim.id)}>
                          ✓ Approve
                        </Button>
                        <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white w-full" onClick={() => handleReject(claim.id)}>
                          ✕ Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                {claim.status !== 'pending' && (
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedClaim(claim)}>
                      <Eye size={14} className="mr-1" /> View
                    </Button>
                    {claim.uploadedFile && (
                      <Button size="sm" variant="outline" onClick={() => viewUploadedFile(claim)}>
                        <FileDown size={14} className="mr-1" /> View Form
                      </Button>
                    )}
                    {claim.uploadedFile && (
                      <Button size="sm" variant="outline" onClick={() => downloadUploadedFile(claim)}>
                        <FileDown size={14} className="mr-1" /> Download Form
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => downloadRequestPdf(claim)}>
                      <FileDown size={14} className="mr-1" /> Summary
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>

      {selectedClaim && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-white w-full max-w-lg p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Allowance Claim Details</h2>
            <div className="space-y-2 text-sm text-slate-700">
              <p><strong>Employee:</strong> {selectedClaim.createdBy}</p>
              <p><strong>Amount:</strong> ₹{selectedClaim.payload?.amount}</p>
              <p><strong>Description:</strong> {selectedClaim.payload?.description}</p>
              <p><strong>Status:</strong> {selectedClaim.status}</p>
              <p><strong>Receipt:</strong> {selectedClaim.payload?.billFileName || 'Not provided'}</p>
              {selectedClaim.uploadedFile && (
                <p><strong>Uploaded Form:</strong> {selectedClaim.uploadedFile.name}</p>
              )}
            </div>
            <div className="flex gap-2">
              {selectedClaim.uploadedFile && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewingFile(selectedClaim.uploadedFile);
                    setSelectedClaim(null);
                  }}
                  className="flex-1"
                >
                  View Form
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedClaim(null)} className="flex-1">
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      <FileViewerModal file={viewingFile} onClose={() => setViewingFile(null)} />
    </MainLayout>
  );
}
