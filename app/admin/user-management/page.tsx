'use client';

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Filter, CheckCircle, XCircle, Clock, Users as UsersIcon, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) return;
        const data = await response.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error('User fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    const interval = setInterval(fetchUsers, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleApproveUser = async (id: string) => {
    const response = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id, updates: { status: 'active' } }),
    });
    if (!response.ok) {
      toast.error('Unable to approve user');
      return;
    }
    toast.success('✅ User approved!');
  };

  const handleSuspendUser = async (id: string) => {
    const response = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id, updates: { status: 'suspended' } }),
    });
    if (!response.ok) {
      toast.error('Unable to suspend user');
      return;
    }
    toast.error('⏸️ User suspended!');
  };

  const getUserType = (user: any) => {
    const designation = (user.designation || '').toLowerCase();
    if (designation.includes('intern')) return 'Intern';
    if (designation.includes('freelancer')) return 'Freelancer';
    if (designation.includes('employee')) return 'Employee';
    if (user.role === 'admin') return 'Admin';
    if (user.role === 'founder') return 'Founder';
    return 'User';
  };

  const filteredUsers = users
    .filter((user) => filterType === 'all' || getUserType(user) === filterType)
    .filter((user) => filterStatus === 'all' || user.status === filterStatus)
    .filter(
      (user) =>
        (user.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'denied':
        return 'bg-slate-100 text-slate-700';
      case 'suspended':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="text-green-500" size={18} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={18} />;
      case 'denied':
        return <XCircle className="text-slate-500" size={18} />;
      case 'suspended':
        return <UserX className="text-red-500" size={18} />;
      default:
        return null;
    }
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === 'active').length,
    pending: users.filter((u) => u.status === 'pending').length,
    employees: users.filter((u) => getUserType(u) === 'Employee').length,
    interns: users.filter((u) => getUserType(u) === 'Intern').length,
    freelancers: users.filter((u) => getUserType(u) === 'Freelancer').length,
  };

  return (
    <MainLayout>
      <div className="max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">👥 User Management</h1>
          <p className="text-slate-600">Monitor users, registrations, and manage access</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card className="bg-blue-50 p-4 border-l-4 border-blue-500">
            <p className="text-sm text-slate-600">Total Users</p>
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          </Card>
          <Card className="bg-green-50 p-4 border-l-4 border-green-500">
            <p className="text-sm text-slate-600">Active</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </Card>
          <Card className="bg-yellow-50 p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-slate-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </Card>
          <Card className="bg-purple-50 p-4 border-l-4 border-purple-500">
            <p className="text-sm text-slate-600">Employees</p>
            <p className="text-2xl font-bold text-purple-600">{stats.employees}</p>
          </Card>
          <Card className="bg-indigo-50 p-4 border-l-4 border-indigo-500">
            <p className="text-sm text-slate-600">Interns</p>
            <p className="text-2xl font-bold text-indigo-600">{stats.interns}</p>
          </Card>
          <Card className="bg-orange-50 p-4 border-l-4 border-orange-500">
            <p className="text-sm text-slate-600">Freelancers</p>
            <p className="text-2xl font-bold text-orange-600">{stats.freelancers}</p>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="Employee">Employees</option>
            <option value="Intern">Interns</option>
            <option value="Freelancer">Freelancers</option>
          </select>
          <select
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="denied">Denied</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <UsersIcon size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">User</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Registered</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Last Login</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{user.fullName || user.username}</p>
                          <p className="text-xs text-slate-500">{user.designation || 'Not Set'}</p>
                          <p className="text-xs text-blue-600">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
                          {getUserType(user)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(user.status)}
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              user.status
                            )}`}
                          >
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {user.approvedAt ? new Date(user.approvedAt).toLocaleDateString('en-IN') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center flex-wrap">
                          {user.status === 'pending' && (
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white text-xs"
                              onClick={() => handleApproveUser(user.id)}
                            >
                              Approve
                            </Button>
                          )}
                          {user.status !== 'suspended' && (
                            <Button
                              size="sm"
                              className="bg-orange-500 hover:bg-orange-600 text-white text-xs"
                              onClick={() => handleSuspendUser(user.id)}
                            >
                              Suspend
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Activity Info */}
        <Card className="p-6 bg-blue-50 border-l-4 border-blue-500">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">📊 User Activity Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-600">Online Now</p>
              <p className="text-lg font-bold text-blue-600">{users.filter((u) => u.status === 'active').length}</p>
            </div>
            <div>
              <p className="text-slate-600">Awaiting Approval</p>
              <p className="text-lg font-bold text-yellow-600">{users.filter((u) => u.status === 'pending').length}</p>
            </div>
            <div>
              <p className="text-slate-600">Denied</p>
              <p className="text-lg font-bold text-slate-600">{users.filter((u) => u.status === 'denied').length}</p>
            </div>
            <div>
              <p className="text-slate-600">Suspended</p>
              <p className="text-lg font-bold text-red-600">{users.filter((u) => u.status === 'suspended').length}</p>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
