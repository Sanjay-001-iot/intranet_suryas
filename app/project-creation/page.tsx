'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { FileUp, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function ProjectCreationPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    projectTitle: '',
    projectStatus: 'planned',
    createdBy: user?.fullName || '',
    abstract: null as File | null,
    abstractFileName: '',
    clientName: '',
    clientOrganization: '',
    clientDesignation: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    projectAmount: '',
    forwardedBy: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed for Abstract');
        return;
      }
      setFormData((prev) => ({ ...prev, abstract: file, abstractFileName: file.name }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.projectTitle || !formData.abstract || !formData.clientName) {
      toast.error('Please fill in all required fields and upload the proposal form');
      return;
    }

    const fileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    try {
      const fileBase64 = await fileToBase64(formData.abstract);
      const getSignatureFrom = (designation?: string) => {
        const roleValue = (designation || '').toLowerCase();
        if (roleValue.includes('intern')) return 'Hareesh';
        if (roleValue.includes('freelancer') || roleValue.includes('employee')) return 'Founder';
        return 'Admin';
      };

      const signatureFrom = getSignatureFrom(user?.designation);

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'proposal',
          title: 'Project Proposal',
          createdBy: user?.fullName || user?.username || 'User',
          createdById: user?.id,
          createdByRole: user?.role,
          createdByDesignation: user?.designation,
          target: 'admin',
          signatureFrom,
          uploadedFile: {
            name: formData.abstract.name,
            size: formData.abstract.size,
            type: formData.abstract.type,
            base64: fileBase64,
            uploadedAt: new Date().toISOString(),
          },
          payload: {
            projectTitle: formData.projectTitle,
            projectStatus: formData.projectStatus,
            createdBy: formData.createdBy,
            abstractFileName: formData.abstractFileName,
            clientName: formData.clientName,
            clientOrganization: formData.clientOrganization,
            clientDesignation: formData.clientDesignation,
            clientAddress: formData.clientAddress,
            clientPhone: formData.clientPhone,
            clientEmail: formData.clientEmail,
            projectAmount: formData.projectAmount,
            forwardedBy: formData.forwardedBy,
            submittedAt: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        toast.error('Failed to submit proposal');
        return;
      }

      toast.success('Proposal created successfully! Submitted to Admin.');
      setFormData({
        projectTitle: '',
        projectStatus: 'planned',
        createdBy: user?.fullName || '',
        abstract: null,
        abstractFileName: '',
        clientName: '',
        clientOrganization: '',
        clientDesignation: '',
        clientAddress: '',
        clientPhone: '',
        clientEmail: '',
        projectAmount: '',
        forwardedBy: '',
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error converting file:', error);
      toast.error('Error processing file. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <MainLayout>
      <div className="max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Form - 3 columns */}
        <div className="lg:col-span-3">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Proposal Creation</h1>
          <p className="text-slate-600 mb-6">Create and submit new proposals</p>

          <Card className="bg-white p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Details */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-4">Proposal Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Proposal Title *</label>
                  <Input
                    type="text"
                    name="projectTitle"
                    placeholder="Enter project title"
                    value={formData.projectTitle}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Proposal Status</label>
                    <select
                      name="projectStatus"
                      value={formData.projectStatus}
                      onChange={(e) => setFormData((prev) => ({ ...prev, projectStatus: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-blue-500"
                    >
                      <option value="planned">Planned</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">Review</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Created By</label>
                    <Input value={formData.createdBy} disabled className="bg-slate-100" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Proposal Abstract (PDF) *</label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                      <Upload size={18} className="text-blue-600" />
                      <span className="text-sm text-blue-600 font-medium">Click to upload PDF</span>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {formData.abstractFileName && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                      <FileUp size={16} />
                      {formData.abstractFileName}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Client Details */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-4">Client Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Client Name *</label>
                    <Input
                      type="text"
                      name="clientName"
                      placeholder="Enter client name"
                      value={formData.clientName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Organization</label>
                    <Input
                      type="text"
                      name="clientOrganization"
                      placeholder="Enter organization name"
                      value={formData.clientOrganization}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
                    <Input
                      type="text"
                      name="clientDesignation"
                      placeholder="Enter designation"
                      value={formData.clientDesignation}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <Input
                      type="tel"
                      name="clientPhone"
                      placeholder="Enter phone number"
                      value={formData.clientPhone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <Input
                    type="email"
                    name="clientEmail"
                    placeholder="Enter email address"
                    value={formData.clientEmail}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <textarea
                    name="clientAddress"
                    placeholder="Enter complete address"
                    value={formData.clientAddress}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Proposal Amount (₹)</label>
                    <Input
                      type="number"
                      name="projectAmount"
                      placeholder="Enter amount"
                      value={formData.projectAmount}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Forwarded By</label>
                    <Input
                      type="text"
                      name="forwardedBy"
                      placeholder="Your name"
                      value={formData.forwardedBy}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <p className="font-semibold mb-1">Submitted to: Founder</p>
                <p>Your proposal will be reviewed by the founder for approval.</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 flex-1">
                Create Project
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
          </Card>
        </div>

        {/* Profile Photo Section */}
        <div className="lg:col-span-1">
          <Card className="bg-white p-6 sticky top-20">
            <h3 className="font-semibold text-slate-900 mb-4">Your Profile</h3>
            <div className="text-center">
              <img
                src={user?.profilePhoto || 'https://via.placeholder.com/150'}
                alt="Profile"
                className="w-40 h-40 rounded-lg object-cover mx-auto border-4 border-blue-200 mb-4"
              />
              <p className="font-semibold text-slate-900">{user?.fullName || 'Employee Name'}</p>
              <p className="text-sm text-slate-600">{user?.id}</p>
              <p className="text-sm text-slate-600">{user?.designation}</p>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
