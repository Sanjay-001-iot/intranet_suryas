'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Mail } from 'lucide-react';

export default function SponsorshipPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <MainLayout>
      <div className="max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Sponsorship Programs</h1>
        <p className="text-slate-600 mb-8">
          Proposal supports institutions, events, and initiatives through various sponsorship opportunities
        </p>

        {/* Sponsorship Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-white p-8 border-l-4 border-green-500">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-green-600" />
              <h3 className="text-xl font-bold text-slate-900">Technical Sponsorship</h3>
            </div>
            <p className="text-slate-700 mb-6">
              We provide technical expertise, PCB design consultations, and hardware solutions for educational events and projects.
            </p>
            <ul className="space-y-2 text-sm text-slate-700 mb-6">
              <li>✓ Hackathon & Workshop Support</li>
              <li>✓ PCB Design Consultations</li>
              <li>✓ Hardware Components Supply</li>
              <li>✓ Expert Mentoring Sessions</li>
            </ul>
            <Button className="w-full bg-green-600 hover:bg-green-700">Request Technical Sponsorship</Button>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-white p-8 border-l-4 border-blue-500">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-blue-600" />
              <h3 className="text-xl font-bold text-slate-900">Financial Sponsorship</h3>
            </div>
            <p className="text-slate-700 mb-6">
              Support for educational initiatives, scholarships, and events that align with our mission of innovation and excellence.
            </p>
            <ul className="space-y-2 text-sm text-slate-700 mb-6">
              <li>✓ Student Scholarships</li>
              <li>✓ Event Sponsorship</li>
              <li>✓ Research Projects</li>
              <li>✓ Awards & Recognition</li>
            </ul>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">Request Financial Sponsorship</Button>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="bg-white p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">How Our Sponsorship Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">1</div>
              <h4 className="font-semibold text-slate-900 mb-2">Submit Request</h4>
              <p className="text-sm text-slate-600">Send your sponsorship request with details</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">2</div>
              <h4 className="font-semibold text-slate-900 mb-2">Review Process</h4>
              <p className="text-sm text-slate-600">We evaluate alignment with our mission</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">3</div>
              <h4 className="font-semibold text-slate-900 mb-2">Approval</h4>
              <p className="text-sm text-slate-600">Agreement on terms and benefits</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">4</div>
              <h4 className="font-semibold text-slate-900 mb-2">Support</h4>
              <p className="text-sm text-slate-600">We provide agreed sponsorship support</p>
            </div>
          </div>
        </Card>

        {/* Current Initiatives */}
        <Card className="bg-white p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Current Sponsorship Initiatives</h2>
          <div className="space-y-6">
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-slate-900 mb-2">🎓 Educational Partnerships</h3>
              <p className="text-slate-700 mb-2">
                We have signed MOUs with several educational institutions to support student projects and internships.
              </p>
              <p className="text-sm text-slate-600">Current partnerships with technical colleges across Tamil Nadu</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-slate-900 mb-2">🌱 Innovation Labs</h3>
              <p className="text-slate-700 mb-2">
                Support for student-led innovation projects and research in electronics and renewable energy.
              </p>
              <p className="text-sm text-slate-600">Monthly innovation challenges with prizes and recognition</p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-slate-900 mb-2">♻️ Sustainability Initiatives</h3>
              <p className="text-slate-700 mb-2">
                Sponsorship of eco-friendly projects focusing on renewable energy and sustainable electronics design.
              </p>
              <p className="text-sm text-slate-600">Green technology workshops and solar panel implementation projects</p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-semibold text-slate-900 mb-2">🎯 Community Outreach</h3>
              <p className="text-slate-700 mb-2">
                We support community programs that promote STEM education and digital literacy.
              </p>
              <p className="text-sm text-slate-600">Regular workshops and training programs in local communities</p>
            </div>
          </div>
        </Card>

        {/* Sponsorship Request Form */}
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Request Sponsorship</h2>

          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Organization Name</label>
                <input type="text" placeholder="Enter organization name" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                <input type="text" placeholder="Your name" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-blue-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" placeholder="your.email@example.com" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input type="tel" placeholder="+91 XXXXX XXXXX" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sponsorship Type</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-blue-500">
                <option>Select sponsorship type</option>
                <option>Technical Sponsorship</option>
                <option>Financial Sponsorship</option>
                <option>Both</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Event/Initiative Description</label>
              <textarea placeholder="Describe your event or initiative" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-blue-500" rows={4} />
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2">
                <Mail size={16} />
                Submit Request
              </Button>
              <Button variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-white rounded-lg text-sm text-slate-700">
            <p>
              <strong>Note:</strong> Sponsorship decisions are based on alignment with our mission, available resources, and marketing outcomes. We'll review your request and get back to you within 5-7 business days.
            </p>
          </div>
        </Card>

        {/* Contact */}
        <Card className="bg-slate-50 border-2 border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Questions About Sponsorship?</h2>
          <p className="text-slate-700 mb-4">
            Reach out to us for more information about sponsorship opportunities and customized solutions.
          </p>
          <div className="space-y-2">
            <p className="text-slate-700">
              <strong>Email:</strong>{' '}
              <a href="mailto:proprietor@suryas.in" className="text-blue-600 hover:text-blue-700">
                proprietor@suryas.in
              </a>
            </p>
            <p className="text-slate-700">
              <strong>WhatsApp:</strong> +91 81242 27370
            </p>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
