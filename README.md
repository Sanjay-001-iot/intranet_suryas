# 🏢 SURYA'S MiB Intranet Portal

A modern, secure virtual intranet platform built with **Next.js 16**, **React 19**, and **Tailwind CSS**. Designed for seamless employee engagement, admin management, and guest access.

## ✨ Features

### 🔐 Authentication & Authorization
- Multi-role login system (Admin, User, Guest)
- Secure profile setup modal
- Role-based access control
- Guest purpose tracking modal

### 📊 Admin Dashboard
- **Leave Management** - Approve/reject employee leave requests
- **Allowance Claims** - Manage travel allowance claims
- **Project Management** - Track ongoing projects
- **User Management** - Monitor system users
- **Analytics & Reports** - Detailed system insights
- **Login History** - Track user activity
- **Events & Webinars** - Upcoming company events carousel

### 👥 Employee Features
- Leave request submission
- Allowance claim filing
- Project creation and tracking
- Form gallery with downloadable documents
- Certificate requests
- Internal revenue tracking

### 🎯 Guest Portal
- Guest purpose collection modal
- Limited access to company information
- Default user icon profile
- Purpose tracking

### 📄 Company Information
- Founder profile and background
- UDYAM certificate display
- Company registrations (MSME)
- Contact information
- Company history and achievements

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/LashminiAD/intranet_suryas.git
cd intranet_suryas

# Install dependencies
npm install

# Start development server
npm run dev
```

### View in Browser

Once the dev server is running, open your browser and go to:

**👉 [http://localhost:3000](http://localhost:3000)**

> **⚠️ IMPORTANT:** Make sure the dev server is running before clicking the link!
> 
> In your terminal, you should see:
> ```
> ✓ Next.js 16.1.4 (Turbopack)
> ✓ Ready in XXXms
> - Local:         http://localhost:3000
> ```

If the page doesn't load:
1. ✅ **Ensure terminal shows** `✓ Ready in XXXms`
2. ✅ **Check port 3000** is not blocked by another app
3. ✅ **Clear browser cache** (Ctrl+Shift+Del)
4. ✅ **Hard refresh** the page (Ctrl+F5 or Cmd+Shift+R)
5. ✅ **Restart dev server** if still not working

## 📁 Project Structure

```
suryas-intranet/
├── app/
│   ├── admin-dashboard/        # Main admin console
│   ├── admin/                  # Admin sub-pages
│   │   ├── leave-management/
│   │   ├── ta-claims/
│   │   ├── project-approvals/
│   │   ├── user-management/
│   │   └── reports/
│   ├── login/                  # Login page
│   ├── signup/                 # Registration page
│   ├── homepage/               # Landing page (post-login)
│   ├── dashboard/              # User dashboard
│   ├── forms-gallery/          # Downloadable forms
│   ├── about-founder/          # Company & founder info
│   └── ...other pages
├── components/
│   ├── guest-purpose-modal.tsx # Guest data collection
│   ├── profile-setup-modal.tsx # User profile completion
│   ├── main-layout.tsx         # Master layout
│   ├── events-carousel.tsx     # Events display
│   ├── qr-code-modal.tsx       # Payment QR display
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── auth-context.tsx        # Authentication state
│   └── utils.ts                # Utility functions
└── public/                     # Static assets
```

## 🛠 Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 16.1.4 | React framework |
| **React** | 19.2.3 | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Styling |
| **Lucide React** | Latest | Icons |
| **shadcn/ui** | Latest | UI components |
| **Sonner** | Latest | Toast notifications |

## 🎨 User Flows

### Employee/User Flow
1. Login with credentials
2. Redirected to Homepage
3. Profile setup modal (first-time users)
4. Role selection (Intern/Freelancer/Employee)
5. Access to dashboard and features

### Guest Flow
1. Login with guest credentials
2. Redirected to Homepage
3. **Guest Purpose Modal** appears (Name, Designation, Company, Role, Purpose)
4. Default user icon assigned
5. Access to limited features

### Admin Flow
1. Login with admin credentials
2. Redirected to Homepage
3. Access to Admin Dashboard
4. Full system control and oversight

## 🔄 Key Features Explained

### Guest Purpose Modal
Collects guest information on first login:
- **Name** (required)
- **Designation** (optional)
- **Company Name** (optional)
- **Company Role** (optional)
- **Purpose of Visit** (required) - description box

### Profile Setup Modal
For regular users (non-admin):
- Profile picture upload (required)
- Full name
- Phone number
- Role selection (Intern/Freelancer/Employee)

### Payment Integration
- Single UPI QR code for payments
- Works with all UPI apps (Google Pay, PhonePe, BHIM)
- Copy UPI ID to clipboard
- Zoom QR code functionality

### Forms Gallery
- Category-based form organization
- Download forms directly
- Search and filter capabilities

## 📝 Available Routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/login` | Public | User login |
| `/signup` | Public | New user registration |
| `/homepage` | Authenticated | Landing page |
| `/dashboard` | User/Guest | User dashboard |
| `/admin-dashboard` | Admin | Admin console |
| `/forms-gallery` | All | Downloadable forms |
| `/about-founder` | All | Company information |
| `/leave-form` | User | Submit leave request |
| `/ta-claim` | User | Submit allowance claim |
| `/project-creation` | User | Create projects |
| `/recruitment` | User | Recruitment forms |
| `/sponsorship` | User | Sponsorship requests |
| `/certificate-request` | User | Request certificates |
| `/admin/leave-management` | Admin | Manage leave requests |
| `/admin/ta-claims` | Admin | Manage allowance claims |
| `/admin/project-approvals` | Admin | Approve projects |
| `/admin/user-management` | Admin | Manage users |
| `/admin/reports` | Admin | System reports |

## 🚀 Building & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
vercel
```

## 📝 Environment Variables

Create a `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🐛 Troubleshooting

### Dev Server Won't Start
```bash
# Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Then restart
npm run dev
```

### Dependencies Issues
```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clear Next.js cache
rm -r .next
npm run dev
```

### Page Can't Be Reached
1. Make sure `npm run dev` is running in terminal
2. Look for `✓ Ready in XXXms` message
3. Try `http://localhost:3000` not `https://`
4. Hard refresh browser (Ctrl+F5)

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui Components](https://ui.shadcn.com)

## 📄 License

This project is proprietary. All rights reserved © SURYA'S MiB.

## 👤 Author

**Lashmini AD**
- GitHub: [@LashminiAD](https://github.com/LashminiAD)
- Repository: [intranet_suryas](https://github.com/LashminiAD/intranet_suryas)

---

**Last Updated:** January 22, 2026
**Version:** 2.0 - Full Production Ready
