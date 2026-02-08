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

export default function ReportsPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const [reportType, setReportType] = useState('weekly');
  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    id: user?.id || '',
    reportContent: '',
    reportFile: null as File | null,
    reportFileName: '',
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
        toast.error('Only PDF files are allowed');
        return;
      }
      setFormData((prev) => ({ ...prev, reportFile: file, reportFileName: file.name }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reportContent || !formData.reportFile) {
      toast.error('Please fill in all required fields');
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
      const fileBase64 = await fileToBase64(formData.reportFile);
      const getSignatureFrom = (designation?: string) => {
        const roleValue = (designation || '').toLowerCase();
        if (roleValue.includes('intern')) return 'Hareesh';
        if (roleValue.includes('freelancer') || roleValue.includes('employee')) return 'Founder';
        return 'Admin';
      };

      const signatureFrom = getSignatureFrom(user?.designation);
      const target = signatureFrom === 'Founder' ? 'founder' : 'admin';

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'report',
          title: `${reportType === 'weekly' ? 'Weekly' : 'Monthly'} Report`,
          createdBy: user?.fullName || user?.username || 'User',
          createdById: user?.id,
          createdByRole: user?.role,
          createdByDesignation: user?.designation,
          target,
          uploadedFile: {
            name: formData.reportFile.name,
            size: formData.reportFile.size,
            type: formData.reportFile.type,
            base64: fileBase64,
            uploadedAt: new Date().toISOString(),
          },
          signatureFrom,
          payload: {
            name: formData.name,
            id: formData.id,
            reportContent: formData.reportContent,
            reportFileName: formData.reportFileName,
            reportType,
            submittedAt: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        toast.error('Failed to submit report');
        return;
      }

      toast.success(`${reportType === 'weekly' ? 'Weekly' : 'Monthly'} report submitted! Sent to Admin.`);
      setFormData({
        name: user?.fullName || '',
        id: user?.id || '',
        reportContent: '',
        reportFile: null,
        reportFileName: '',
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Submit Report</h1>
          <p className="text-slate-600 mb-6">Submit your weekly or monthly report</p>

          <Card className="bg-white p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Report Type Selection */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="weekly"
                  checked={reportType === 'weekly'}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-slate-700">Weekly Report</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="monthly"
                  checked={reportType === 'monthly'}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-slate-700">Monthly Report</span>
              </label>
            </div>

            {/* Employee Info */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-4">Your Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <Input value={formData.name} disabled className="bg-slate-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Employee ID</label>
                  <Input value={formData.id} disabled className="bg-slate-100" />
                </div>
              </div>
            </div>

            {/* Report Content */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-4">Report Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">About Report *</label>
                  <textarea
                    name="reportContent"
                    placeholder={`Write your ${reportType} report here... Include accomplishments, challenges, and upcoming tasks.`}
                    value={formData.reportContent}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Report PDF Attachment *</label>
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
                  {formData.reportFileName && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                      <FileUp size={16} />
                      {formData.reportFileName}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <p className="font-semibold mb-1">Submitted to: Founder</p>
                <p>Your report will be reviewed and processed by the founder.</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 flex-1">
                Submit Report
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
