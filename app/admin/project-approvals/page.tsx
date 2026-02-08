'use client';

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Search, Filter, FileDown, Eye, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import FileViewerModal from '@/components/file-viewer-modal';
import { exportToExcel, formatExportDate, getStatusLabel } from '@/lib/excel-export';

export default function ProjectApprovals() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [commentText, setCommentText] = useState('');
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
      const proposalData = (data.requests || []).filter((req: any) => req.type === 'proposal');
      setProjects(proposalData);
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
      toast.error('Unable to approve project');
      return;
    }

    toast.success('✅ Project approved!');
  };

  const handleReject = async (id: string) => {
    const response = await fetch('/api/requests/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: id, action: 'reject' }),
    });

    if (!response.ok) {
      toast.error('❌ Project rejected!');
      return;
    }

    toast.error('❌ Project rejected!');
  };

  const downloadUploadedFile = (project: any) => {
    if (!project.uploadedFile) {
      toast.error('No file available');
      return;
    }
    const link = document.createElement('a');
    link.href = project.uploadedFile.base64;
    link.download = project.uploadedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProjects = projects
    .filter((proj) => filterStatus === 'all' || proj.status === filterStatus)
    .filter(
      (proj) =>
        proj.payload?.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proj.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

  const handleExportToExcel = () => {
    try {
      if (filteredProjects.length === 0) {
        toast.error('No data to export');
        return;
      }

      const exportData = filteredProjects.map((project) => ({
        Username: project.createdBy,
        RequestType: 'Proposal',
        Reason: project.payload?.projectTitle || '',
        Status: getStatusLabel(project.status),
        AppliedDate: formatExportDate(project.createdAt),
      }));

      const columns = [
        { key: 'Username', header: 'Username' },
        { key: 'RequestType', header: 'Request Type' },
        { key: 'Reason', header: 'Reason' },
        { key: 'Status', header: 'Status' },
        { key: 'AppliedDate', header: 'Applied Date' },
      ];

      const dateStamp = new Date().toISOString().split('T')[0];
      exportToExcel(exportData, columns, `Project_Proposals_${dateStamp}`);
      toast.success('✓ Project proposals exported to Excel');
    } catch (error) {
      toast.error('Failed to export data');
      console.error(error);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">📂 Project Approvals</h1>
          <p className="text-slate-600">Review and approve/reject project submissions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by project or submitter..."
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
              <option value="all">All Projects</option>
              <option value="pending">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <Button
            onClick={handleExportToExcel}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={projects.length === 0}
          >
            <Download size={18} className="mr-2" />
            Download Excel
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-yellow-50 p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-slate-600">Under Review</p>
            <p className="text-2xl font-bold text-yellow-600">
              {projects.filter((r) => r.status === 'pending').length}
            </p>
          </Card>
          <Card className="bg-green-50 p-4 border-l-4 border-green-500">
            <p className="text-sm text-slate-600">Approved</p>
            <p className="text-2xl font-bold text-green-600">
              {projects.filter((r) => r.status === 'approved').length}
            </p>
          </Card>
          <Card className="bg-red-50 p-4 border-l-4 border-red-500">
            <p className="text-sm text-slate-600">Rejected</p>
            <p className="text-2xl font-bold text-red-600">
              {projects.filter((r) => r.status === 'rejected').length}
            </p>
          </Card>
          <Card className="bg-blue-50 p-4 border-l-4 border-blue-500">
            <p className="text-sm text-slate-600">Total Projects</p>
            <p className="text-2xl font-bold text-blue-600">{projects.length}</p>
          </Card>
        </div>

        <div className="space-y-4">
          {filteredProjects.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-slate-600">No projects found</p>
            </Card>
          ) : (
            filteredProjects.map((project) => (
              <Card
                key={project.id}
                className={`p-6 border-l-4 ${
                  project.status === 'pending'
                    ? 'border-yellow-500 bg-yellow-50'
                    : project.status === 'approved'
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                }`}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                    <div className="md:col-span-2">
                      <p className="text-xs text-slate-600 mb-1">PROJECT TITLE</p>
                      <p className="text-lg font-bold text-slate-900 mb-2">{project.payload?.projectTitle}</p>
                      <p className="text-xs text-slate-600 mb-1">SUBMITTED BY</p>
                      <p className="text-sm text-slate-700">
                        {project.createdBy} <span className="text-slate-500">({project.createdByDesignation || 'Employee'})</span>
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-600 mb-1">BUDGET</p>
                      <p className="text-xl font-bold text-slate-900">₹{Number(project.payload?.projectAmount || 0).toLocaleString()}</p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-600 mb-1">SUBMITTED</p>
                      <p className="text-sm text-slate-700 mb-3">{new Date(project.createdAt).toLocaleDateString('en-IN')}</p>
                      <p className="text-xs text-slate-600 mb-1">FORM</p>
                      <p className="text-sm text-slate-700">{project.uploadedFile?.name || project.payload?.abstractFileName || 'Not provided'}</p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-600 mb-1">STATUS</p>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(project.status)}
                        <span
                          className={`text-sm font-semibold ${
                            project.status === 'pending'
                              ? 'text-yellow-600'
                              : project.status === 'approved'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {project.status === 'pending'
                            ? 'Under Review'
                            : project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <p className="text-xs text-slate-600 mb-2">DESCRIPTION</p>
                    <p className="text-sm text-slate-700">{project.payload?.clientOrganization || 'No description provided'}</p>
                  </div>

                  {project.status === 'pending' && (
                    <div className="border-t border-slate-200 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                          <textarea
                            placeholder="Add comments or feedback..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-2 md:col-span-2">
                          {project.uploadedFile && (
                            <Button size="sm" variant="outline" onClick={() => setViewingFile(project.uploadedFile)}>
                              <Eye size={14} className="mr-1" /> View Form
                            </Button>
                          )}
                          {project.uploadedFile && (
                            <Button size="sm" variant="outline" onClick={() => downloadUploadedFile(project)}>
                              <FileDown size={14} className="mr-1" /> Download Form
                            </Button>
                          )}
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white"
                            onClick={() => handleApprove(project.id)}
                          >
                            ✓ Approve
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => handleReject(project.id)}
                          >
                            ✕ Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  {project.status !== 'pending' && (
                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex flex-wrap gap-2">
                        {project.uploadedFile && (
                          <Button size="sm" variant="outline" onClick={() => setViewingFile(project.uploadedFile)}>
                            <Eye size={14} className="mr-1" /> View Form
                          </Button>
                        )}
                        {project.uploadedFile && (
                          <Button size="sm" variant="outline" onClick={() => downloadUploadedFile(project)}>
                            <FileDown size={14} className="mr-1" /> Download Form
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-white w-full max-w-lg p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Project Details</h2>
            <div className="space-y-2 text-sm text-slate-700">
              <p><strong>Project:</strong> {selectedProject.payload?.projectTitle}</p>
              <p><strong>Submitted By:</strong> {selectedProject.createdBy}</p>
              <p><strong>Status:</strong> {selectedProject.status}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedProject(null)} className="flex-1">
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
