'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Users, HelpCircle, Mail, Phone, Send } from 'lucide-react';
import { toast } from 'sonner';
import { EventsCarousel } from '@/components/events-carousel';

export default function GuestDashboard() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySubject, setInquirySubject] = useState('');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inquirySubject.trim() || !inquiryMessage.trim()) {
      toast.error('Please fill in both subject and message');
      return;
    }

    setIsSubmittingInquiry(true);

    try {
      const response = await fetch('/api/guest-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: user?.fullName,
          email: user?.email,
          subject: inquirySubject,
          message: inquiryMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit inquiry');
      }

      toast.success('Your inquiry has been sent to admin!');
      setInquirySubject('');
      setInquiryMessage('');
    } catch (error) {
      console.error('Inquiry submission error:', error);
      toast.error('Failed to send inquiry. Please try again.');
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <MainLayout>
      <div className="max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome, {user?.fullName}!</h1>
          <p className="text-slate-600">Guest Access Portal</p>
        </div>

        {/* Events Carousel */}
        <EventsCarousel />

        {/* Quick Access Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recruitment */}
          <Card className="bg-gradient-to-br from-slate-50 to-white p-6 hover:shadow-lg transition border-l-4 border-blue-500">
            <div className="flex items-center gap-4 mb-4">
              <Users className="w-8 h-8 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">Recruitment</h3>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Check our internship opportunities and career openings. We welcome talented individuals to join our team.
            </p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">View Opportunities</Button>
          </Card>

          {/* Sponsorship */}
          <Card className="bg-gradient-to-br from-slate-50 to-white p-6 hover:shadow-lg transition border-l-4 border-green-500">
            <div className="flex items-center gap-4 mb-4">
              <Heart className="w-8 h-8 text-green-600" />
              <h3 className="text-lg font-bold text-slate-900">Sponsorship</h3>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Learn about our sponsorship programs and how we support institutions and events.
            </p>
            <Button className="w-full bg-green-600 hover:bg-green-700">Sponsorship Details</Button>
          </Card>

          {/* Service Inquiries */}
          <Card className="bg-gradient-to-br from-slate-50 to-white p-6 hover:shadow-lg transition border-l-4 border-purple-500">
            <div className="flex items-center gap-4 mb-4">
              <HelpCircle className="w-8 h-8 text-purple-600" />
              <h3 className="text-lg font-bold text-slate-900">Service Inquiries</h3>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Have questions about our services? Get in touch with our support team today.
            </p>
            <Button className="w-full bg-purple-600 hover:bg-purple-700">Contact Us</Button>
          </Card>
        </div>

        {/* Company Information & Contact */}
        <Card className="bg-white p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">About Proposal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-slate-700 mb-4">
                Proposal is your guest-facing gateway to explore company services, partnerships, and opportunities.
              </p>
              <p className="text-slate-700">
                <strong>Mission:</strong> Deliver clear and responsive communication for every visitor.
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-2">Quick Contact</h4>
                <div className="space-y-2 text-sm text-slate-700">
                  <p className="flex items-center gap-2">
                    <Phone size={16} className="text-blue-600" />
                    +91 81242 27370
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail size={16} className="text-blue-600" />
                    suryas@suryas.in
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Contact & Social Links */}
        <Card className="bg-gradient-to-r from-slate-900 to-blue-900 text-white p-8">
          <h2 className="text-2xl font-bold mb-6">Connect With Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-blue-100 mb-2">LinkedIn</p>
              <a href="#" className="text-white hover:text-blue-300 font-medium break-all">
                linkedin.com/company/suryas-mib
              </a>
            </div>
            <div>
              <p className="text-sm text-blue-100 mb-2">Instagram</p>
              <a href="#" className="text-white hover:text-blue-300 font-medium">
                @suryas_mib
              </a>
            </div>
          </div>
        </Card>

        {/* Guest User Info */}
        <Card className="bg-blue-50 border-2 border-blue-200 p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Your Guest Profile</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-700">Name</p>
              <p className="text-blue-900 font-semibold">{user?.fullName}</p>
            </div>
            <div>
              <p className="text-blue-700">Designation</p>
              <p className="text-blue-900 font-semibold">{user?.designation}</p>
            </div>
            <div>
              <p className="text-blue-700">Email</p>
              <p className="text-blue-900 font-semibold">{user?.email}</p>
            </div>
            <div>
              <p className="text-blue-700">Guest ID</p>
              <p className="text-blue-900 font-semibold">{user?.id}</p>
            </div>
          </div>
        </Card>

        {/* Inquiry Section */}
        <Card className="bg-white p-8 border-t-4 border-purple-500">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-2">
              <HelpCircle className="w-6 h-6 text-purple-600" />
              Send an Inquiry to Admin
            </h2>
            <p className="text-slate-600 text-sm">Have any questions or need assistance? Submit your inquiry below and our admin team will get back to you.</p>
          </div>

          <form onSubmit={handleInquirySubmit} className="space-y-4">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Subject *</label>
              <input
                type="text"
                placeholder="Enter inquiry subject"
                value={inquirySubject}
                onChange={(e) => setInquirySubject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Message *</label>
              <textarea
                placeholder="Describe your inquiry..."
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmittingInquiry}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-2"
              >
                <Send size={18} />
                {isSubmittingInquiry ? 'Sending...' : 'Send Inquiry'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
