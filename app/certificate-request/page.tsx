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

export default function CertificateRequestPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    empId: user?.id || '',
    mentorName: '',
    mentorPhone: '',
    mentorEmail: '',
    collegeName: '',
    yearDept: '',
    filledFormFile: null as File | null,
    filledFormFileName: '',
    noDemandCertificate: null as File | null,
    noDemandFileName: '',
    certificateType: 'intern',
    reportFile: null as File | null,
    reportFileName: '',
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
    if (!file) return;

    if (e.target.name === 'filledFormFile') {
      if (!file.type.includes('pdf') && !file.type.includes('image')) {
        toast.error('Only PDF and image files are allowed');
        return;
      }
      setFormData((prev) => ({ ...prev, filledFormFile: file, filledFormFileName: file.name }));
    } else if (e.target.name === 'noDemandCertificate') {
      if (!file.type.includes('pdf') && !file.type.includes('image')) {
        toast.error('Only PDF and image files are allowed');
        return;
      }
      setFormData((prev) => ({ ...prev, noDemandCertificate: file, noDemandFileName: file.name }));
    } else if (e.target.name === 'reportFile') {
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed for reports');
        return;
      }
      setFormData((prev) => ({ ...prev, reportFile: file, reportFileName: file.name }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.mentorName || !formData.collegeName || !formData.noDemandCertificate || !formData.reportFile || !formData.filledFormFile) {
      toast.error('Please fill in all required fields and upload the filled form');
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
      const fileBase64 = await fileToBase64(formData.filledFormFile);
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
          type: 'certificate',
          title: 'Certificate Request',
          createdBy: user?.fullName || user?.username || 'User',
          createdById: user?.id,
          createdByRole: user?.role,
          createdByDesignation: user?.designation,
          target: 'admin',
          signatureFrom,
          uploadedFile: {
            name: formData.filledFormFile.name,
            size: formData.filledFormFile.size,
            type: formData.filledFormFile.type,
            base64: fileBase64,
            uploadedAt: new Date().toISOString(),
          },
          payload: {
            fullName: formData.fullName,
            empId: formData.empId,
            mentorName: formData.mentorName,
            mentorPhone: formData.mentorPhone,
            mentorEmail: formData.mentorEmail,
            collegeName: formData.collegeName,
            yearDept: formData.yearDept,
            certificateType: formData.certificateType,
            noDemandFileName: formData.noDemandFileName,
            reportFileName: formData.reportFileName,
            forwardedBy: formData.forwardedBy,
            submittedAt: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        toast.error('Failed to submit certificate request');
        return;
      }

      toast.success('Certificate request submitted to Admin.');
      setFormData({
        fullName: user?.fullName || '',
        empId: user?.id || '',
        mentorName: '',
        mentorPhone: '',
        mentorEmail: '',
        collegeName: '',
        yearDept: '',
        filledFormFile: null,
        filledFormFileName: '',
        noDemandCertificate: null,
        noDemandFileName: '',
        certificateType: 'intern',
        reportFile: null,
        reportFileName: '',
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Certificate Request</h1>
          <p className="text-slate-600 mb-6">Request your certificate with all required documentation</p>

          <Card className="bg-white p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Identity */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-4">Your Identity</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <Input value={formData.fullName} disabled className="bg-slate-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Employee ID</label>
                  <Input value={formData.empId} disabled className="bg-slate-100" />
                </div>
              </div>
            </div>

            {/* Mentor Details */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-4">Mentor Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mentor Name *</label>
                  <Input
                    type="text"
                    name="mentorName"
                    placeholder="Enter mentor name"
                    value={formData.mentorName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <Input
                      type="tel"
                      name="mentorPhone"
                      placeholder="Enter phone number"
                      value={formData.mentorPhone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <Input
                      type="email"
                      name="mentorEmail"
                      placeholder="Enter email"
                      value={formData.mentorEmail}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Education Details */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-4">Education Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">College Name *</label>
                  <Input
                    type="text"
                    name="collegeName"
                    placeholder="Enter college name"
                    value={formData.collegeName}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Year/Department</label>
                  <Input
                    type="text"
                    name="yearDept"
                    placeholder="e.g., 2nd Year ECE"
                    value={formData.yearDept}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-4">Certificate Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Certificate Type</label>
                  <select
                    name="certificateType"
                    value={formData.certificateType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, certificateType: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-blue-500"
                  >
                    <option value="intern">Intern</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Filled Certificate Request Form (PDF/Image) *</label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                      <Upload size={18} className="text-blue-600" />
                      <span className="text-sm text-blue-600 font-medium">Click to upload</span>
                      <input
                        type="file"
                        name="filledFormFile"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {formData.filledFormFileName && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                      <FileUp size={16} />
                      {formData.filledFormFileName}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">No Demand Certificate (PDF/Image) *</label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                      <Upload size={18} className="text-blue-600" />
                      <span className="text-sm text-blue-600 font-medium">Click to upload</span>
                      <input
                        type="file"
                        name="noDemandCertificate"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {formData.noDemandFileName && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                      <FileUp size={16} />
                      {formData.noDemandFileName}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Final Report (PDF) *</label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                      <Upload size={18} className="text-blue-600" />
                      <span className="text-sm text-blue-600 font-medium">Click to upload PDF</span>
                      <input
                        type="file"
                        name="reportFile"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {formData.reportFileName && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                      <FileUp size={16} />
                      {formData.reportFileName}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Forwarded By (Head of Team)</label>
                  <Input
                    type="text"
                    name="forwardedBy"
                    placeholder="Enter name"
                    value={formData.forwardedBy}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <p className="font-semibold mb-1">Submitted to: Admin</p>
                <p>Your certificate request will be processed after review and approval by the Head of Team.</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 flex-1">
                Submit Request
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
