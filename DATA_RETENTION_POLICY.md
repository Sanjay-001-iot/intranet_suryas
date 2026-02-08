# Data Retention & Auto-Reset Policy

## Overview
The Suryas Intranet implements an automatic data retention and cleanup policy to manage storage efficiently. All approval requests (Leave, TA Claims, Projects) and related data are automatically reset after 2 months with advance notifications to admins.

## Storage Timeline

### Active Phase (Days 0-25)
- **Status**: ✅ All data is active and accessible
- **Action**: None required
- **Data Retention**: Full access to all records

### Warning Phase (Days 25-30)
- **Status**: ⚠️ Notification sent to Admin & Founder
- **Notification Title**: "Data Backup Reminder - 1 Month Until Reset"
- **Action Required**: 
  - Download all approval records as Excel
  - Backup important data
  - Archive any critical information
- **Time Remaining**: ~5 days to download

### Critical Phase (Days 31-60)
- **Status**: 🔴 Final notice issued
- **Notification Title**: "FINAL NOTICE - Data Reset Imminent"
- **Action Required**:
  - Immediately download all remaining data
  - Complete any pending archival
  - No more warnings after this
- **Time Remaining**: Data will reset in days remaining

### Auto-Reset Phase (Day 60+)
- **Status**: 🔄 Automatic data reset
- **What Gets Reset**:
  - ✓ All Leave Requests
  - ✓ All Allowance Claims (TA Claims)
  - ✓ All Project Proposals
  - ✓ Company Ledger (balance reset to 0)
  - ✓ All related notifications

- **What's Preserved**:
  - ✓ User accounts and credentials
  - ✓ Backups (saved in `.data/backups/`)
  - ✓ System configuration

## How to Download Data

### Method 1: From Admin Dashboard
1. Look for the data retention warning banner (if applicable)
2. Click **"Download All Data as Excel"** button
3. This exports ALL approval requests with columns:
   - Username
   - Request Type
   - Reason
   - Status
   - Applied Date

### Method 2: From Individual Management Pages
Each admin section has its own Download Excel button:
- **Leave Management**: [/admin/leave-management](../../admin/leave-management)
- **TA Claims**: [/admin/ta-claims](../../admin/ta-claims)
- **Project Approvals**: [/admin/project-approvals](../../admin/project-approvals)

## Notification Recipients

### Who Gets Notified
- **Admin** - Full notifications
- **Founder** - Full notifications
- **Other users** - No retention notifications

### Notification Channels
- In-app notifications (displayed on dashboard)
- Email notifications (if email system is configured)
- Warning banner on admin dashboard

## Data Backup & Recovery

### Automatic Backups
Before each auto-reset, the system automatically creates a backup:
- **Location**: `.data/backups/backup-[timestamp]/`
- **Contents**:
  - requests.json
  - company-ledger.json
- **Retention**: Keep for record-keeping purposes

### How to Access Backups
```
.data/backups/
├── backup-2025-02-08T20-08-30-123Z/
│   ├── requests.json
│   └── company-ledger.json
└── [other backups...]
```

## Technical Details

### Configuration Files
- **Retention Config**: `.data/retention-config.json`
  - Tracks data creation date
  - Records notification status
  
- **Retention DB**: `.data/notifications.json`
  - Stores all data retention notifications
  - Tracks read/unread status

### Database Files Reset
1. `.data/requests.json` → Reset to `[]`
2. `.data/company-ledger.json` → Reset to `{"balance": 0, "transactions": []}`

### Files NOT Reset
- `.data/users.json` (user accounts preserved)
- `.data/retention-config.json` (configuration refreshed)

## API Endpoints

### Check Data Retention Status
```
GET /api/admin/data-retention?action=status
```
Response:
```json
{
  "status": "warning|critical|active|reset-due",
  "message": "...",
  "daysRemaining": 30,
  "dataAge": { "days": 30, "months": 1, ... },
  "notifications": [...]
}
```

### Get Retention Notifications
```
GET /api/admin/data-retention?action=notifications&recipient=admin
```

### Check & Apply Retention Policy
```
GET /api/admin/data-retention?action=check
```
Automatically:
- Checks if notifications should be sent
- Applies auto-reset if 60 days reached
- Updates configuration

## Best Practices

### For Admins
1. **Check regularly** (at least weekly) for data retention warnings
2. **Download data proactively** - Don't wait for the critical phase
3. **Archive important records** in your local system or external storage
4. **Share critical data** with the Founder before reset

### For Founders
1. **Monitor notifications** - Set a calendar reminder for reviews
2. **Approve pending requests** before the critical phase
3. **Download ledger data** if you need historical analysis
4. **Plan ahead** - Know your busy periods to avoid data loss

## Troubleshooting

### Problem: "No data to export"
- **Cause**: All approval requests have been deleted or reset
- **Solution**: Restore from backups in `.data/backups/`

### Problem: Notification not appearing
- **Cause**: Browser cache, or you've already dismissed it
- **Solution**: Clear browser cache, or wait for the next notification window

### Problem: System reset data too early
- **Cause**: System clock was adjusted, or data creation date is incorrect
- **Solution**: Check retention config in `.data/retention-config.json`

## FAQ

**Q: Can I extend the retention period?**
A: Modify `.data/retention-config.json` to change the `dataCreatedAt` timestamp. (Admin only)

**Q: What if I'm on vacation and can't download?**
A: The system sends warnings for 30 days. Ask another admin to download on your behalf.

**Q: Can I recover deleted data after reset?**
A: Yes, from the backup files in `.data/backups/backup-[timestamp]/`

**Q: Does this affect user accounts?**
A: No, only approval requests are reset. User accounts remain intact.

**Q: How often is the retention check performed?**
A: Admin dashboard checks every 60 seconds. Manual check available via API.

## Contact & Support
For questions about the data retention policy or Excel exports:
- Contact: System Administrator
- Documentation: This file
- API Docs: `/api/admin/data-retention` endpoints
