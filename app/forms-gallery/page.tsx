'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, FileText, Eye, Upload, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function FormsGalleryPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [forms, setForms] = useState([
    {
      id: 0,
      name: 'Internal Renewal Form',
      description: 'Admin-only internal renewal and financial tracking form',
      fileSize: 'Access Restricted',
      category: 'Admin',
      fileType: 'PAGE',
      fileName: 'Internal Renewal',
      uploadedDate: '2026-02-04',
      adminOnly: true,
      href: '/internal-revenue',
    },
    {
      id: 1,
      name: 'Application Form',
      description: 'General application form for various purposes',
      fileSize: '424 KB',
      category: 'Admin',
      fileType: 'PDF',
      fileName: 'Application Form.pdf',
      uploadedDate: '2024-01-22',
    },
    {
      id: 2,
      name: 'Board Meeting Form',
      description: 'Form for board meetings and minutes documentation',
      fileSize: '274 KB',
      category: 'Admin',
      fileType: 'PDF',
      fileName: 'Board Meet Form.pdf',
      uploadedDate: '2024-01-22',
    },
    {
      id: 3,
      name: 'Event Payment Declaration',
      description: 'Declaration form for event-related payments',
      fileSize: '273 KB',
      category: 'Finance',
      fileType: 'PDF',
      fileName: 'Event Payment Declaration.pdf',
      uploadedDate: '2024-01-22',
    },
    {
      id: 4,
      name: 'External Person - Event Form',
      description: 'Form for external participants in company events',
      fileSize: '417 KB',
      category: 'Events',
      fileType: 'PDF',
      fileName: 'External Person - Event Form.pdf',
      uploadedDate: '2024-01-22',
    },
    {
      id: 5,
      name: 'Leave Form',
      description: 'Application form for requesting leave from work',
      fileSize: '284 KB',
      category: 'HR',
      fileType: 'PDF',
      fileName: 'Leave Form.pdf',
      uploadedDate: '2024-01-22',
    },
    {
      id: 6,
      name: 'No Demand Certificate Format',
      description: 'Certificate format stating no outstanding demands',
      fileSize: '274 KB',
      category: 'Legal',
      fileType: 'PDF',
      fileName: 'No Demand Certificate Formet.pdf',
      uploadedDate: '2024-01-22',
    },
    {
      id: 7,
      name: 'Non-Bill Expense Form',
      description: 'Form for submitting non-billable expense reports',
      fileSize: '377 KB',
      category: 'Finance',
      fileType: 'PDF',
      fileName: 'Non-Bill Expencs.pdf',
      uploadedDate: '2024-01-22',
    },
    {
      id: 8,
      name: 'Payment Consent Form',
      description: 'Consent form for payment authorization',
      fileSize: '208 KB',
      category: 'Finance',
      fileType: 'PDF',
      fileName: 'Payment Consent From.pdf',
      uploadedDate: '2024-01-22',
    },
    {
      id: 9,
      name: 'Payment Voucher',
      description: 'Voucher format for payment documentation',
      fileSize: '371 KB',
      category: 'Finance',
      fileType: 'PDF',
      fileName: 'Payment Voucher.pdf',
      uploadedDate: '2024-01-22',
    },
    {
      id: 10,
      name: 'R&D Declaration',
      description: 'Declaration form for research and development activities',
      fileSize: '285 KB',
      category: 'Projects',
      fileType: 'PDF',
      fileName: 'R&D Declaration.pdf',
      uploadedDate: '2024-01-22',
    },
    {
      id: 11,
      name: 'Post Cover',
      description: 'Cover letter template for postal correspondence',
      fileSize: '294 KB',
      category: 'Admin',
      fileType: 'PDF',
      fileName: 'Post Cover.pdf',
      uploadedDate: '2024-01-24',
    },
    {
      id: 12,
      name: 'Part Time Employment Form',
      description: 'Form for part-time employment agreements and documentation',
      fileSize: '229 KB',
      category: 'HR',
      fileType: 'PDF',
      fileName: 'Part time.pdf',
      uploadedDate: '2024-01-24',
    },
    {
      id: 13,
      name: 'Project Agreement',
      description: 'Legal agreement form for project collaboration',
      fileSize: '8 KB',
      category: 'Legal',
      fileType: 'PDF',
      fileName: 'Project Agreement.pdf',
      uploadedDate: '2024-01-24',
    },
    {
      id: 14,
      name: 'Weekly & Monthly Report Form',
      description: 'Template for submitting weekly and monthly activity reports',
      fileSize: '141 KB',
      category: 'Reports',
      fileType: 'PDF',
      fileName: 'Surya_MiB_Weekly_Monthly_Report.pdf',
      uploadedDate: '2024-01-24',
    },
  ]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    name: '',
    description: '',
    category: 'HR',
    file: null as File | null,
  });

  const allCategories = ['all', 'HR', 'Finance', 'Projects', 'Admin', 'Events', 'Legal', 'Training', 'Reports'];
  const categories = user?.role === 'admin' || user?.role === 'founder'
    ? allCategories
    : allCategories.filter((category) => category !== 'Admin');

  const handleDownload = (form: any) => {
    if (form.href) {
      window.open(form.href, '_blank');
      toast.success(`Opened: ${form.name}`);
      return;
    }
    const link = document.createElement('a');
    link.href = `/forms/${form.fileName}`;
    link.download = form.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded: ${form.name}`);
  };

  const handleView = (form: any) => {
    if (form.href) {
      window.open(form.href, '_blank');
      return;
    }
    const filePath = `/forms/${form.fileName}`;
    window.open(filePath, '_blank');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed');
        return;
      }
      setUploadData((prev) => ({ ...prev, file }));
    }
  };

  const handleUploadForm = () => {
    if (!uploadData.name || !uploadData.description || !uploadData.file) {
      toast.error('Please fill in all fields and select a file');
      return;
    }

    const newForm = {
      id: Math.max(...forms.map(f => f.id), 0) + 1,
      name: uploadData.name,
      description: uploadData.description,
      category: uploadData.category,
      fileSize: Math.round(uploadData.file.size / 1024) + ' KB',
      fileType: 'PDF',
      fileName: uploadData.file.name,
      uploadedDate: new Date().toISOString().split('T')[0],
    };

    setForms([...forms, newForm]);
    setUploadData({ name: '', description: '', category: 'HR', file: null });
    setShowUploadModal(false);
    toast.success(`Form "${uploadData.name}" uploaded successfully!`);
  };

  const handleDeleteForm = (formId: number) => {
    setForms(forms.filter(f => f.id !== formId));
    toast.success('Form deleted successfully');
  };

  const visibleForms = user?.role === 'admin' || user?.role === 'founder'
    ? forms
    : forms.filter((form: any) => !form.adminOnly && form.category !== 'Admin');

  const filteredForms = selectedCategory === 'all'
    ? visibleForms
    : visibleForms.filter((form) => form.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'HR': 'bg-blue-100 text-blue-700 border-blue-300',
      'Finance': 'bg-green-100 text-green-700 border-green-300',
      'Projects': 'bg-purple-100 text-purple-700 border-purple-300',
      'Admin': 'bg-orange-100 text-orange-700 border-orange-300',
      'Events': 'bg-pink-100 text-pink-700 border-pink-300',
      'Legal': 'bg-red-100 text-red-700 border-red-300',
      'Training': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'Reports': 'bg-indigo-100 text-indigo-700 border-indigo-300',
    };
    return colors[category] || 'bg-slate-100 text-slate-700 border-slate-300';
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <MainLayout>
      <div className="max-w-7xl space-y-8">
        {/* Header with Upload Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Forms & Documents Gallery</h1>
            <p className="text-slate-600">Download all required company forms and documents</p>
          </div>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
            >
              <Plus size={20} />
              Upload Form
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
              {category !== 'all' && ` (${forms.filter(f => f.category === category).length})`}
            </button>
          ))}
        </div>

        {/* Forms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-600">No forms found in this category</p>
            </div>
          ) : (
            filteredForms.map((form) => (
              <Card
                key={form.id}
                className="bg-white p-6 hover:shadow-lg transition border-l-4 border-blue-500"
              >
                <div className="space-y-4">
                  {/* Form Icon & Title */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="text-blue-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900">{form.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">{form.description}</p>
                    </div>
                  </div>

                  {/* Category Badge & File Info */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(
                        form.category
                      )}`}
                    >
                      {form.category}
                    </span>
                    <span className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
                      {form.fileSize}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleView(form)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition text-sm"
                    >
                      <Eye size={16} />
                      View
                    </button>
                    <button
                      onClick={() => handleDownload(form)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition text-sm"
                    >
                      <Download size={16} />
                      Download
                    </button>
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => handleDeleteForm(form.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Information Card */}
        <Card className="bg-blue-50 border-l-4 border-blue-600 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-3">📌 Important Notes</h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>✓ All forms must be filled completely and accurately</li>
            <li>✓ Forms can be downloaded and printed or filled digitally</li>
            <li>✓ Submitted forms will be reviewed by the respective departments</li>
            <li>✓ Keep a copy for your records</li>
            <li>✓ For form-related queries, contact: admin@suryas.in</li>
          </ul>
        </Card>

        {/* Download Limit Info */}
        <Card className="bg-yellow-50 border-l-4 border-yellow-500 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-3">⚙️ Technical Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-700">
            <div>
              <p className="font-semibold text-slate-900">File Format</p>
              <p>PDF format for easy viewing and printing</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Browser Support</p>
              <p>Works with all modern web browsers</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Security</p>
              <p>All documents are secure and encrypted</p>
            </div>
          </div>
        </Card>

        {/* Upload Form Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-white max-w-lg w-full p-6 space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">Upload New Form</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Form Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Expense Report Form"
                    value={uploadData.name}
                    onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                  <textarea
                    placeholder="Brief description of the form"
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-blue-500"
                  >
                    {['HR', 'Finance', 'Projects', 'Admin', 'Events', 'Legal', 'Training', 'Reports'].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Upload PDF File *</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                  {uploadData.file && (
                    <p className="mt-2 text-sm text-green-600">✓ {uploadData.file.name}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUploadForm}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
                >
                  Upload Form
                </button>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadData({ name: '', description: '', category: 'HR', file: null });
                  }}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
