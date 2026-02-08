'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface ContactEntry {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
}

const defaultContacts: ContactEntry[] = [
  {
    id: 'contact-001',
    name: 'Golla Kumar Bharath',
    role: 'Founder',
    department: 'Leadership',
    email: 'proprietor@suryas.in',
    phone: '+91 90001 23456',
  },
  {
    id: 'contact-002',
    name: 'Jayendra M',
    role: 'Administrator',
    department: 'Administration',
    email: 'administrator@suryas.in',
    phone: '+91 90002 34567',
  },
  {
    id: 'contact-003',
    name: 'Technical Team',
    role: 'Support',
    department: 'Engineering',
    email: 'technicalteam@suryas.in',
    phone: '+91 90003 45678',
  },
];

export default function ContactPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [contacts, setContacts] = useState<ContactEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ContactEntry | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const stored = localStorage.getItem('contacts');
    if (stored) {
      setContacts(JSON.parse(stored));
    } else {
      localStorage.setItem('contacts', JSON.stringify(defaultContacts));
      setContacts(defaultContacts);
    }
  }, [isAuthenticated, router]);

  const isAdmin = user?.role === 'admin' || user?.role === 'founder';

  const openModal = (entry?: ContactEntry) => {
    if (entry) {
      setEditing(entry);
      setFormData({
        name: entry.name,
        role: entry.role,
        department: entry.department,
        email: entry.email,
        phone: entry.phone,
      });
    } else {
      setEditing(null);
      setFormData({ name: '', role: '', department: '', email: '', phone: '' });
    }
    setShowModal(true);
  };

  const saveContacts = (next: ContactEntry[]) => {
    setContacts(next);
    localStorage.setItem('contacts', JSON.stringify(next));
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      toast.error('Name and email are required');
      return;
    }

    if (editing) {
      const updated = contacts.map((contact) =>
        contact.id === editing.id ? { ...contact, ...formData } : contact
      );
      saveContacts(updated);
      toast.success('Contact updated');
    } else {
      const newContact: ContactEntry = {
        id: `contact-${Date.now()}`,
        ...formData,
      };
      saveContacts([newContact, ...contacts]);
      toast.success('Contact added');
    }

    setShowModal(false);
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <MainLayout>
      <div className="max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Contact Directory</h1>
            <p className="text-slate-600">Active contacts across the organization</p>
          </div>
          {isAdmin && (
            <Button onClick={() => openModal()} className="flex items-center gap-2">
              <Plus size={16} /> Add Contact
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((contact) => (
            <Card key={contact.id} className="bg-white p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{contact.name}</h3>
                  <p className="text-sm text-slate-600">{contact.role}</p>
                  <p className="text-xs text-slate-500">{contact.department}</p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => openModal(contact)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={16} />
                  </button>
                )}
              </div>
              <div className="text-sm text-slate-700 space-y-1">
                <p><span className="font-semibold">Email:</span> {contact.email}</p>
                <p><span className="font-semibold">Phone:</span> {contact.phone || 'Not provided'}</p>
              </div>
            </Card>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-white w-full max-w-lg p-6 space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">
                {editing ? 'Edit Contact' : 'Add Contact'}
              </h2>
              <div className="space-y-3">
                <Input
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  placeholder="Role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
                <Input
                  placeholder="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
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
