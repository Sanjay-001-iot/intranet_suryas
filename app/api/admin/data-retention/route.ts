import { NextRequest, NextResponse } from 'next/server';
import { getDataAge, getRetentionConfig, markNotificationSent, resetRetentionConfig, getDataRetentionStatus, hasNotificationBeenSent } from '@/lib/data-retention';
import { createDataRetentionNotification, getDataRetentionNotifications } from '@/lib/data-retention-notifications';
import fs from 'fs';
import path from 'path';

const REQUESTS_DB_FILE = path.join(process.cwd(), '.data', 'requests.json');
const NOTIFICATIONS_DB_FILE = path.join(process.cwd(), '.data', 'notifications.json');
const COMPANY_LEDGER_FILE = path.join(process.cwd(), '.data', 'company-ledger.json');

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get('action');
  
  // Check data retention status
  const age = getDataAge();
  const status = getDataRetentionStatus();
  
  // Get existing notifications
  const adminNotifications = getDataRetentionNotifications('admin');
  
  if (action === 'check') {
    // Check and create notifications if needed
    
    // 1-Month Warning (25+ days)
    if (age.isNearing1Month && !hasNotificationBeenSent()) {
      createDataRetentionNotification('data-retention-warning', status.daysRemaining, 'all');
      markNotificationSent();
    }
    
    // 2-Month Auto Reset (60+ days)
    if (age.shouldReset) {
      // Backup current data before reset
      const backup = backupData();
      
      // Reset all data
      resetAllData();
      
      // Create notification
      createDataRetentionNotification('data-reset-complete', 0, 'all');
      resetRetentionConfig();
      
      return NextResponse.json({
        success: true,
        message: 'Data has been reset after 60 days',
        backup: backup,
      });
    }
    
    return NextResponse.json({
      status: status.status,
      message: status.message,
      daysRemaining: status.daysRemaining,
      dataAge: age,
      notificationSent: adminNotifications.length > 0,
    });
  }
  
  if (action === 'status') {
    return NextResponse.json({
      status: status.status,
      message: status.message,
      daysRemaining: status.daysRemaining,
      dataAge: age,
      dataCreatedAt: getRetentionConfig().dataCreatedAt,
      notifications: adminNotifications,
    });
  }
  
  if (action === 'notifications') {
    const recipient = request.nextUrl.searchParams.get('recipient') as 'admin' | 'founder' || 'admin';
    const notifications = getDataRetentionNotifications(recipient);
    return NextResponse.json({
      notifications,
      count: notifications.length,
      unreadCount: notifications.filter((n) => !n.read).length,
    });
  }
  
  return NextResponse.json({
    status: status.status,
    message: status.message,
    daysRemaining: status.daysRemaining,
    age: age,
  });
}

function backupData() {
  try {
    const backupDir = path.join(process.cwd(), '.data', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${timestamp}`;
    const backupPath = path.join(backupDir, backupName);
    
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }
    
    // Backup requests
    if (fs.existsSync(REQUESTS_DB_FILE)) {
      fs.copyFileSync(REQUESTS_DB_FILE, path.join(backupPath, 'requests.json'));
    }
    
    // Backup company ledger
    if (fs.existsSync(COMPANY_LEDGER_FILE)) {
      fs.copyFileSync(COMPANY_LEDGER_FILE, path.join(backupPath, 'company-ledger.json'));
    }
    
    return {
      success: true,
      backupPath: backupName,
      timestamp,
    };
  } catch (error) {
    console.error('Backup error:', error);
    return {
      success: false,
      error: 'Failed to create backup',
    };
  }
}

function resetAllData() {
  try {
    const dir = path.dirname(REQUESTS_DB_FILE);
    
    // Reset requests
    if (fs.existsSync(REQUESTS_DB_FILE)) {
      fs.writeFileSync(REQUESTS_DB_FILE, JSON.stringify([]));
    }
    
    // Reset company ledger
    if (fs.existsSync(COMPANY_LEDGER_FILE)) {
      fs.writeFileSync(COMPANY_LEDGER_FILE, JSON.stringify({ balance: 0, transactions: [] }));
    }
    
    return true;
  } catch (error) {
    console.error('Reset error:', error);
    return false;
  }
}
