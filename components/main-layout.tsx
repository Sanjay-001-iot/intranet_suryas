'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { QRCodeModal } from '@/components/qr-code-modal';
import { ProfileSetupModal } from '@/components/profile-setup-modal';
import { NotificationBell } from '@/components/notification-bell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  FileText,
  DollarSign,
  FolderPlus,
  BarChart3,
  Users,
  Heart,
  Download,
  DollarSignIcon,
  Award,
  LogOut,
  Menu,
  X,
  Clock,
  User,
  Share2,
  CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedQR, setSelectedQR] = useState<any>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  const isFounder = user?.role === 'founder';
  const isAdmin = user?.role === 'admin' || isFounder;
  const isGuest = user?.role === 'guest';

  const paymentMethods = [
    { id: 'upi', name: 'UPI Payment', image: '/qr-upi.jpeg', upi: 'Q946965798@ybl' },
  ];

  const handleQRClick = (method: any) => {
    setSelectedQR(method);
    setShowQRModal(true);
  };

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);


  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  if (!user) {
    return <>{children}</>;
  }

  const adminNavItems = [
    { label: 'Dashboard', icon: Home, href: '/admin-dashboard' },
    { label: 'Leave Management', icon: FileText, href: '/admin/leave-management' },
    { label: 'Allowance Claims', icon: DollarSign, href: '/admin/ta-claims' },
    { label: 'Project Approvals', icon: FolderPlus, href: '/admin/project-approvals' },
    { label: 'User Management', icon: Users, href: '/admin/user-management' },
    { label: 'Reports', icon: BarChart3, href: '/admin/reports' },
    { label: 'Forms', icon: Download, href: '/forms-gallery' },
    { label: 'Internal Renewal', icon: DollarSignIcon, href: '/internal-revenue' },
    { label: 'Contacts', icon: Users, href: '/contact' },
    { label: 'Circulars', icon: FileText, href: '/circulars' },
    { label: 'Recruitment', icon: Users, href: '/recruitment' },
    { label: 'Sponsorship', icon: Heart, href: '/sponsorship' },
  ];

  const guestNavItems = [
    { label: 'Recruitment', icon: Users, href: '/recruitment' },
    { label: 'Sponsorship', icon: Heart, href: '/sponsorship' },
  ];

  const employeeNavItems = [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'Leave Form', icon: FileText, href: '/leave-form' },
    { label: 'Allowance Claim', icon: DollarSign, href: '/ta-claim' },
    { label: 'Proposal', icon: FolderPlus, href: '/project-creation' },
    { label: 'Reports', icon: BarChart3, href: '/reports' },
    { label: 'Recruitment', icon: Users, href: '/recruitment' },
    { label: 'Sponsorship', icon: Heart, href: '/sponsorship' },
    { label: 'Forms', icon: Download, href: '/forms-gallery' },
    { label: 'Contacts', icon: Users, href: '/contact' },
    { label: 'Company Info', icon: Award, href: '/company-content' },
    { label: 'Certificate Request', icon: Award, href: '/certificate-request' },
  ];

  const navItems = isAdmin ? adminNavItems : isGuest ? guestNavItems : employeeNavItems;

  const founderImg = 'https://surya-s.zohosites.in/OWNER.jpg';
  const logoImg = 'https://surya-s.zohosites.in/Remini20220710111603029-removebg.png';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 fixed h-screen flex flex-col shadow-2xl z-50`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
              <img src={logoImg} alt="SURYA'S MiB ENTERPRISE" className="w-full h-full object-cover" />
            </div>
            {sidebarOpen && <span className="text-sm font-bold whitespace-nowrap">SURYA'S MiB ENTERPRISE</span>}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-slate-700 rounded text-white"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition text-slate-100 hover:text-white group"
                title={!sidebarOpen ? item.label : ''}
              >
                <item.icon size={20} className="flex-shrink-0 group-hover:text-blue-400" />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </Link>
            ))}
          </div>
        </nav>

        {/* Founder Section */}
        {true && (
          <Link
            href="/about-founder"
            className="border-t border-slate-700 p-4 hover:bg-slate-700 transition group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <img
                src={founderImg}
                alt="Founder"
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-400 group-hover:border-blue-300"
              />
              {sidebarOpen && (
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white group-hover:text-blue-300 truncate">G K Bharath</p>
                  <p className="text-xs text-slate-400">Founder</p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-3 text-xs h-8 border-blue-400 text-blue-300 hover:bg-blue-500 hover:text-white"
              >
                View Policy
              </Button>
            )}
          </Link>
        )}

        {/* Payment QR Codes Section */}
        <div className="border-t border-slate-700 p-3">
          {sidebarOpen && (
            <>
              <p className="text-xs font-semibold text-slate-400 mb-3 px-1">Payment Methods</p>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleQRClick(method)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700 transition text-slate-100 hover:text-white group text-xs"
                    title={method.name}
                  >
                    <div className="w-8 h-8 bg-slate-600 rounded flex items-center justify-center group-hover:bg-blue-500 transition">
                      <CreditCard size={16} />
                    </div>
                    <span className="text-xs truncate">{method.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {!sidebarOpen && (
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleQRClick(method)}
                  className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-700 transition text-slate-100 hover:text-white"
                  title={method.name}
                >
                  <CreditCard size={18} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="border-t border-slate-700 p-4">
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} flex-1 flex flex-col transition-all duration-300`}>
        {/* Top Header */}
        <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logoImg} alt="Logo" className="h-10 w-auto" />
              <div className="flex items-center gap-4">
                <Clock size={18} className="text-slate-500" />
                <span className="text-sm text-slate-600">
                  {currentTime.toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            </div>

            {/* User Profile Dropdown */}
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              {!isGuest && <NotificationBell />}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3">
                    {isGuest ? (
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                    ) : isAdmin ? (
                      <img
                        src={user.profilePhoto || '/default-admin.svg'}
                        alt="Admin Profile"
                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-400"
                        style={{ objectPosition: 'center 0%' }}
                      />
                    ) : (
                      <img
                        src={user.profilePhoto || 'https://via.placeholder.com/40'}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-400"
                        style={{ objectPosition: 'center 0%' }}
                      />
                    )}
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-slate-900">{user.fullName || user.username}</p>
                      <p className="text-xs text-slate-500">{isFounder ? 'Founder' : isAdmin ? 'Administrator' : user.designation}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>User Profile</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {!isGuest && (
                    <div className="px-4 py-3 text-center mb-2">
                      <img src={logoImg} alt="Logo" className="h-8 w-auto mx-auto mb-2" />
                      <p className="text-xs text-slate-500">SURYA'S MiB ENTERPRISE</p>
                    </div>
                  )}
                  <div className="px-4 py-3 space-y-2">
                    <div>
                      <p className="text-xs text-slate-500">Full Name</p>
                      <p className="text-sm font-semibold">{user.fullName || user.username}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">ID Number</p>
                      <p className="text-sm font-semibold font-mono">{user.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Designation</p>
                      <p className="text-sm font-semibold">{user.designation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="text-sm font-semibold text-blue-600">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {!isGuest && (
                    <>
                      <DropdownMenuItem onClick={() => setShowProfileEditor(true)}>
                        <User size={16} className="mr-2" />
                        Edit Profile
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem>
                          <Share2 size={16} className="mr-2" />
                          Management Console
                        </DropdownMenuItem>
                      )}
                      {isAdmin && <DropdownMenuSeparator />}
                    </>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </div>

      {/* QR Code Modal */}
      {selectedQR && (
        <QRCodeModal
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setSelectedQR(null);
          }}
          qrCode={selectedQR}
        />
      )}

      <ProfileSetupModal
        isOpen={showProfileEditor}
        onClose={() => setShowProfileEditor(false)}
        mode="edit"
      />
    </div>
  );
}
