'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUp, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function LeaveFormPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    id: user?.id || '',
    designation: user?.designation || '',
    email: user?.email || '',
    phone: '',
    leaveType: 'personal',
    fromDate: '',
    toDate: '',
    reason: '',
    isPastDateRequest: false,
    filledFormFile: null as File | null,
    medicalCertificate: null as File | null,
    medicalProof: null as File | null,
  });

  const [filledFormFileName, setFilledFormFileName] = useState('');
  const [certificateFileName, setCertificateFileName] = useState('');
  const [medicalProofFileName, setMedicalProofFileName] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, leaveType: value }));
  };

  const handleFilledFormUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.includes('pdf') && !file.type.includes('image')) {
        toast.error('Only PDF and image files are allowed');
        return;
      }
      setFormData((prev) => ({ ...prev, filledFormFile: file }));
      setFilledFormFileName(file.name);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed');
        return;
      }
      setFormData((prev) => ({ ...prev, medicalCertificate: file }));
      setCertificateFileName(file.name);
    }
  };

  const handleMedicalProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed');
        return;
      }
      setFormData((prev) => ({ ...prev, medicalProof: file }));
      setMedicalProofFileName(file.name);
    }
  };

  const isSickLeave = formData.leaveType === 'sick';
  const isMedicalReason = /medical|doctor|hospital|surgery|fever|ill|sick|clinic/i.test(
    formData.reason
  );

  const validateDates = () => {
    if (!formData.fromDate || !formData.toDate) {
      toast.error('Please select valid dates');
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fromDate = new Date(formData.fromDate);
    const toDate = new Date(formData.toDate);

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      toast.error('Invalid date');
      return false;
    }

    if (!formData.isPastDateRequest && (fromDate < today || toDate < today)) {
      toast.error('Please select a valid future date');
      return false;
    }

    if (toDate < fromDate) {
      toast.error('To date must be after From date');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.fromDate || !formData.toDate || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!validateDates()) {
      return;
    }

    if (isSickLeave && !formData.medicalCertificate) {
      toast.error('Medical Certificate is required for Sick Leave');
      return;
    }

    const getSignatureFrom = (designation?: string) => {
      const roleValue = (designation || '').toLowerCase();
      if (roleValue.includes('intern')) return 'Hareesh';
      if (roleValue.includes('freelancer') || roleValue.includes('employee')) return 'Founder';
      return 'Admin';
    };

    const signatureFrom = getSignatureFrom(user?.designation);
    const isAdminRequester = user?.role === 'admin';
    const target = signatureFrom === 'Founder' ? 'founder' : 'admin';
    const finalTarget = isAdminRequester ? 'founder' : target;

    // Convert file to base64
    const fileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    try {
      const fileBase64 = formData.filledFormFile
        ? await fileToBase64(formData.filledFormFile)
        : null;

      const leaveTitle = `${formData.leaveType.toUpperCase()} Leave Request`;
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'leave',
          title: formData.isPastDateRequest ? `Past-Date ${leaveTitle}` : leaveTitle,
          createdBy: user?.fullName || user?.username || 'User',
          createdById: user?.id,
          createdByRole: user?.role,
          createdByDesignation: user?.designation,
          target: finalTarget,
          uploadedFile: fileBase64 && formData.filledFormFile
            ? {
                name: formData.filledFormFile.name,
                size: formData.filledFormFile.size,
                type: formData.filledFormFile.type,
                base64: fileBase64,
                uploadedAt: new Date().toISOString(),
              }
            : undefined,
          signatureFrom,
          payload: {
            name: formData.name,
            id: formData.id,
            designation: formData.designation,
            email: formData.email,
            phone: formData.phone,
            leaveType: formData.leaveType,
            fromDate: formData.fromDate,
            toDate: formData.toDate,
            reason: formData.reason,
            isPastDateRequest: formData.isPastDateRequest,
            filledFormFileName: filledFormFileName,
            medicalCertificateName: certificateFileName,
            medicalProofName: medicalProofFileName,
            submittedAt: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        toast.error('Failed to submit leave request');
        return;
      }

      toast.success('Leave request submitted successfully!');
      // Reset form
      setFormData({
        name: user?.fullName || '',
        id: user?.id || '',
        designation: user?.designation || '',
        email: user?.email || '',
        phone: '',
        leaveType: 'personal',
        fromDate: '',
        toDate: '',
        reason: '',
        isPastDateRequest: false,
        filledFormFile: null,
        medicalCertificate: null,
        medicalProof: null,
      });
      setFilledFormFileName('');
      setCertificateFileName('');
      setMedicalProofFileName('');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error converting file:', error);
      toast.error('Error processing file. Please try again.');
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <MainLayout>
      <div className="max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Leave Application Form</h1>
        <p className="text-slate-600 mb-6">Submit your leave request here</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Employee Details Section */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-4">Employee Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                      <Input value={formData.name} disabled className="bg-slate-100" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Employee ID</label>
                      <Input value={formData.id} disabled className="bg-slate-100" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
                      <Input value={formData.designation} disabled className="bg-slate-100" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <Input value={formData.email} disabled className="bg-slate-100" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                      <Input
                        type="tel"
                        name="phone"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Leave Details Section */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-4">Leave Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type *</label>
                      <Select value={formData.leaveType} onValueChange={handleSelectChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sick">Sick Leave</SelectItem>
                          <SelectItem value="personal">Personal Leave</SelectItem>
                          <SelectItem value="emergency">Emergency Leave</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                      <label className="flex items-start gap-3 text-sm text-amber-900 cursor-pointer">
                        <input
                          type="checkbox"
                          name="isPastDateRequest"
                          checked={formData.isPastDateRequest}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              isPastDateRequest: e.target.checked,
                            }))
                          }
                          className="mt-1"
                        />
                        <span>
                          <span className="font-semibold">Past-date leave request</span>
                          <span className="block text-xs text-amber-700 mt-1">
                            Use this for post-leave or correction requests (previous dates).
                          </span>
                        </span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">From Date *</label>
                        <Input
                          type="date"
                          name="fromDate"
                          value={formData.fromDate}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">To Date *</label>
                        <Input
                          type="date"
                          name="toDate"
                          value={formData.toDate}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Leave *</label>
                      <textarea
                        name="reason"
                        placeholder="Enter your reason for leave"
                        value={formData.reason}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </div>

                    {/* Mandatory Filled Form Upload */}
                    <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                      <div className="flex items-start gap-2 mb-3">
                        <span className="text-amber-600 text-xl">⚠️</span>
                        <div>
                          <h3 className="font-semibold text-amber-900">Optional: Upload Filled Form</h3>
                          <p className="text-sm text-amber-700 mt-1">
                            Before submitting, download the Leave Form from the{' '}
                            <a href="/forms-gallery" className="underline font-medium">Forms Gallery</a>, 
                            fill it completely, and upload it here.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFilledFormUpload(e)}
                          className="text-sm"
                        />
                        {filledFormFileName && (
                          <span className="text-sm text-green-600 font-medium">
                            ✓ {filledFormFileName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {isMedicalReason && !isSickLeave
                          ? 'Medical Certificate (Optional)'
                          : 'Medical Proof/Certificate (PDF) - For long medical leaves'}
                      </label>
                      <p className="text-xs text-slate-500 mb-2">
                        {isMedicalReason && !isSickLeave
                          ? 'Medical proof is optional for this request.'
                          : 'Upload medical certificate or proof if you have one (optional)'}
                      </p>
                      <div className="flex items-center gap-2">
                        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:bg-purple-50 transition">
                          <Upload size={18} className="text-purple-600" />
                          <span className="text-sm text-purple-600 font-medium">Click to upload PDF</span>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handleMedicalProofUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {medicalProofFileName && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                          <FileUp size={16} />
                          {medicalProofFileName}
                        </div>
                      )}
                    </div>

                    {formData.leaveType === 'sick' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Medical Certificate (PDF only) *</label>
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
                        {certificateFileName && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                            <FileUp size={16} />
                            {certificateFileName}
                          </div>
                        )}
                      </div>
                    )}

                    {formData.leaveType === 'emergency' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Medical Certificate (PDF only) - Optional for Emergency</label>
                        <div className="flex items-center gap-2">
                          <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-amber-300 rounded-lg cursor-pointer hover:bg-amber-50 transition">
                            <Upload size={18} className="text-amber-600" />
                            <span className="text-sm text-amber-600 font-medium">Click to upload PDF</span>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                        {certificateFileName && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                            <FileUp size={16} />
                            {certificateFileName}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 flex-1">
                    Submit Request
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
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

                {/* Leave Balance */}
                <div className="mt-6 bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-3 text-sm">Leave Balance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Leaves</span>
                      <span className="font-semibold text-slate-900">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Leaves Taken</span>
                      <span className="font-semibold text-slate-900">3</span>
                    </div>
                    <div className="h-px bg-slate-200 my-2" />
                    <div className="flex justify-between">
                      <span className="text-slate-600">Remaining</span>
                      <span className="font-semibold text-green-600">9</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
