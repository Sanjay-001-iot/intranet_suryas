'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface CircularEntry {
  id: string;
  title: string;
  date: string;
  time: string;
  category: string;
  details: string;
}

export default function CircularsPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [circulars, setCirculars] = useState<CircularEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CircularEntry | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    category: 'Notice',
    details: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'admin' && user?.role !== 'founder') {
      router.push('/homepage');
      return;
    }
  }, [isAuthenticated, router, user]);

  const fetchCirculars = async () => {
    try {
      const response = await fetch('/api/circulars');
      if (!response.ok) return;
      const data = await response.json();
      const mapped = (data.circulars || []).map((c: any) => ({
        id: c.id,
        title: c.title,
        date: c.meta?.date || new Date(c.postedAt).toLocaleDateString('en-IN'),
        time: c.meta?.time || new Date(c.postedAt).toLocaleTimeString('en-IN'),
        category: c.meta?.category || 'Notice',
        details: c.content,
      }));
      setCirculars(mapped);
    } catch (error) {
      console.error('Failed to fetch circulars:', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'founder')) return;
    fetchCirculars();
    const interval = setInterval(fetchCirculars, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const openModal = (entry?: CircularEntry) => {
    if (entry) {
      setEditing(entry);
      setFormData({
        title: entry.title,
        date: entry.date,
        time: entry.time,
        category: entry.category,
        details: entry.details,
      });
    } else {
      setEditing(null);
      setFormData({ title: '', date: '', time: '', category: 'Notice', details: '' });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.date) {
      toast.error('Title and date are required');
      return;
    }
    const save = async () => {
      try {
        if (editing) {
          const response = await fetch('/api/circulars', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editing.id, updates: formData }),
          });
          if (!response.ok) {
            toast.error('Failed to update circular');
            return;
          }
          toast.success('Circular updated');
        } else {
          const response = await fetch('/api/circulars', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: formData.title,
              content: formData.details,
              postedBy: user?.fullName || user?.username || 'Admin',
              postedByRole: user?.role || 'admin',
              priority: 'medium',
              meta: {
                date: formData.date,
                time: formData.time,
                category: formData.category,
              },
            }),
          });
          if (!response.ok) {
            toast.error('Failed to add circular');
            return;
          }

          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'circular',
              title: 'New Circular Posted',
              message: `${formData.title} (${formData.category})`,
              targetUser: 'all',
            }),
          });

          toast.success('Circular added and notification sent');
        }

        setShowModal(false);
        fetchCirculars();
      } catch (error) {
        console.error('Circular save error:', error);
        toast.error('Unable to save circular');
      }
    };

    save();
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <MainLayout>
      <div className="max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Circulars / Notice Board</h1>
            <p className="text-slate-600">Admin-only announcements for events and updates</p>
          </div>
          <Button onClick={() => openModal()} className="flex items-center gap-2">
            <Plus size={16} /> Add Circular
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {circulars.map((circular) => (
            <Card key={circular.id} className="bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{circular.title}</h3>
                  <p className="text-sm text-slate-600">{circular.category}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {circular.date} • {circular.time}
                  </p>
                </div>
                <button
                  onClick={() => openModal(circular)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit size={16} />
                </button>
              </div>
              <p className="text-sm text-slate-700 mt-3">{circular.details}</p>
            </Card>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-white w-full max-w-lg p-6 space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">
                {editing ? 'Edit Circular' : 'Add Circular'}
              </h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  {['Notice', 'Event', 'Leave', 'Camp', 'Circular'].map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <textarea
                  placeholder="Details"
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  rows={4}
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Save
                </Button>
                <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
