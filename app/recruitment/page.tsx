'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ExternalLink, MapPin, Briefcase, Send, Upload, FileUp } from 'lucide-react';
import { toast } from 'sonner';

export default function RecruitmentPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [requestData, setRequestData] = useState({
    role: '',
    experience: '',
    message: '',
    filledFormFile: null as File | null,
    filledFormFileName: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.includes('pdf') && !file.type.includes('image')) {
      toast.error('Only PDF and image files are allowed');
      return;
    }
    setRequestData((prev) => ({
      ...prev,
      filledFormFile: file,
      filledFormFileName: file.name,
    }));
  };

  const opportunities = [
    {
      id: 1,
      title: 'PCB Design Intern',
      department: 'Electronics Design',
      location: 'Remote',
      duration: '3-6 months',
      description: 'Work on real PCB design projects with our expert team',
      link: 'https://internshala.com/company/surya-s-mib-1717484546/',
    },
    {
      id: 2,
      title: 'Freelancer - Electronics Engineer',
      department: 'Project Based',
      location: 'Remote',
      duration: 'Project Duration',
      description: 'Join our freelancer network for project-based work',
      link: 'https://internshala.com/company/surya-s-mib-1717484546/',
    },
    {
      id: 3,
      title: 'Solar Solutions Developer',
      department: 'Renewable Energy',
      location: 'Remote',
      duration: '6 months',
      description: 'Help develop sustainable solar solutions for businesses',
      link: 'https://internshala.com/company/surya-s-mib-1717484546/',
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Recruitment & Careers</h1>
        <p className="text-slate-600 mb-8">
          Join Proposal and be part of our innovation journey
        </p>

        {/* Information Banner */}
        <Card className="bg-blue-50 border-2 border-blue-200 p-6 mb-8">
          <p className="text-blue-900">
            <strong>📢 Internship Opportunities:</strong> Check our latest internship openings on Internshala every 10th of the month. 
            All stipend internships are published on{' '}
            <a
              href="https://internshala.com/company/surya-s-mib-1717484546/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Internshala
            </a>
          </p>
        </Card>

        {/* Opportunities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {opportunities.map((opp) => (
            <Card key={opp.id} className="bg-white p-6 hover:shadow-lg transition">
              <h3 className="text-lg font-bold text-slate-900 mb-2">{opp.title}</h3>
              <p className="text-sm text-slate-600 mb-4">{opp.department}</p>

              <div className="space-y-2 text-sm text-slate-700 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-blue-600" />
                  {opp.location}
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-green-600" />
                  {opp.duration}
                </div>
              </div>

              <p className="text-sm text-slate-700 mb-6">{opp.description}</p>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                onClick={() => window.open(opp.link, '_blank')}
              >
                <ExternalLink size={16} />
                View on Internshala
              </Button>
            </Card>
          ))}
        </div>

        {/* Why Join */}
        <Card className="bg-white p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Why Join Proposal?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">🚀 Growth & Learning</h3>
              <p className="text-slate-700">
                Work on cutting-edge PCB design, solar solutions, and digital transformation projects with industry experts.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">🌟 Real-World Impact</h3>
              <p className="text-slate-700">
                Contribute to actual projects that power businesses and drive innovation in electronics and renewable energy.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">🎯 Flexible Work</h3>
              <p className="text-slate-700">
                Remote and part-time opportunities designed to fit your schedule. Perfect for students and professionals.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">📜 Certification</h3>
              <p className="text-slate-700">
                Earn recognized certificates upon successful completion of your internship or freelance project.
              </p>
            </div>
          </div>
        </Card>

        {/* Contact */}
        <Card className="bg-slate-50 border-2 border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Questions About Careers?</h2>
          <p className="text-slate-700 mb-4">
            Reach out to our team for more information about opportunities and the application process.
          </p>
          <div className="space-y-2">
            <p className="text-slate-700">
              <strong>Email:</strong>{' '}
              <a href="mailto:vi.interns@suryas.in" className="text-blue-600 hover:text-blue-700">
                vi.interns@suryas.in
              </a>
            </p>
            <p className="text-slate-700">
              <strong>WhatsApp:</strong> +91 81242 27370
            </p>
            <p className="text-slate-700">
              <strong>Internshala:</strong>{' '}
              <a
                href="https://internshala.com/company/surya-s-mib-1717484546/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                Visit our Internshala page
              </a>
            </p>
          </div>
        </Card>

        {/* Recruitment Request Form */}
        <Card className="bg-white p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Recruitment Request</h2>
          <p className="text-slate-600 mb-6">Submit your recruitment interest for admin review.</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!requestData.role || !requestData.message || !requestData.filledFormFile) {
                toast.error('Please fill in role, message, and upload the filled form');
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
                const fileBase64 = await fileToBase64(requestData.filledFormFile);
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
                    type: 'recruitment',
                    title: 'Recruitment Request',
                    createdBy: user?.fullName || user?.username || 'User',
                    createdById: user?.id,
                    createdByRole: user?.role,
                    createdByDesignation: user?.designation,
                    target: 'admin',
                    signatureFrom,
                    uploadedFile: {
                      name: requestData.filledFormFile.name,
                      size: requestData.filledFormFile.size,
                      type: requestData.filledFormFile.type,
                      base64: fileBase64,
                      uploadedAt: new Date().toISOString(),
                    },
                    payload: {
                      role: requestData.role,
                      experience: requestData.experience,
                      message: requestData.message,
                      email: user?.email,
                      filledFormFileName: requestData.filledFormFileName,
                      submittedAt: new Date().toISOString(),
                    },
                  }),
                });

                if (!response.ok) {
                  toast.error('Failed to submit recruitment request');
                  return;
                }

                toast.success('Recruitment request sent to Admin');
                setRequestData({ role: '', experience: '', message: '', filledFormFile: null, filledFormFileName: '' });
              } catch (error) {
                console.error('Error converting file:', error);
                toast.error('Error processing file. Please try again.');
              }
            }}
            className="space-y-4"
          >
            <Input
              placeholder="Role you are applying for"
              value={requestData.role}
              onChange={(e) => setRequestData((prev) => ({ ...prev, role: e.target.value }))}
            />
            <Input
              placeholder="Experience summary"
              value={requestData.experience}
              onChange={(e) => setRequestData((prev) => ({ ...prev, experience: e.target.value }))}
            />
            <textarea
              placeholder="Tell us about your interest"
              value={requestData.message}
              onChange={(e) => setRequestData((prev) => ({ ...prev, message: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-blue-500"
              rows={4}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Filled Recruitment Form (PDF/Image) *</label>
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                  <Upload size={18} className="text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">Click to upload</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {requestData.filledFormFileName && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                  <FileUp size={16} />
                  {requestData.filledFormFileName}
                </div>
              )}
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Send size={16} className="mr-2" /> Submit Request
            </Button>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
