import fs from 'fs';
import path from 'path';

const RETENTION_CONFIG_FILE = path.join(process.cwd(), '.data', 'retention-config.json');

export interface RetentionConfig {
  dataCreatedAt: string; // ISO date when data was first created
  lastNotifiedAt?: string; // When admin was last notified
  notificationSent: boolean; // Whether 1-month notification was sent
}

const DEFAULT_CONFIG: RetentionConfig = {
  dataCreatedAt: new Date().toISOString(),
  notificationSent: false,
};

function ensureConfigDir() {
  const dir = path.dirname(RETENTION_CONFIG_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function getRetentionConfig(): RetentionConfig {
  try {
    ensureConfigDir();
    if (!fs.existsSync(RETENTION_CONFIG_FILE)) {
      fs.writeFileSync(RETENTION_CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
      return DEFAULT_CONFIG;
    }
    const data = fs.readFileSync(RETENTION_CONFIG_FILE, 'utf-8');
    return JSON.parse(data) || DEFAULT_CONFIG;
  } catch (error) {
    console.error('Error reading retention config:', error);
    return DEFAULT_CONFIG;
  }
}

export function updateRetentionConfig(config: Partial<RetentionConfig>) {
  try {
    ensureConfigDir();
    const current = getRetentionConfig();
    const updated = { ...current, ...config };
    fs.writeFileSync(RETENTION_CONFIG_FILE, JSON.stringify(updated, null, 2));
    return updated;
  } catch (error) {
    console.error('Error updating retention config:', error);
    return getRetentionConfig();
  }
}

export function resetRetentionConfig() {
  try {
    ensureConfigDir();
    const newConfig: RetentionConfig = {
      dataCreatedAt: new Date().toISOString(),
      notificationSent: false,
    };
    fs.writeFileSync(RETENTION_CONFIG_FILE, JSON.stringify(newConfig, null, 2));
    return newConfig;
  } catch (error) {
    console.error('Error resetting retention config:', error);
    return DEFAULT_CONFIG;
  }
}

export function getDataAge(): {
  days: number;
  months: number;
  isNearing1Month: boolean;
  isNearing2Months: boolean;
  shouldReset: boolean;
} {
  const config = getRetentionConfig();
  const createdAt = new Date(config.dataCreatedAt);
  const now = new Date();
  
  const diffMs = now.getTime() - createdAt.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  
  // 1 month = 30 days, 2 months = 60 days
  const isNearing1Month = diffDays >= 25 && diffDays < 30; // Notify 5 days before
  const isNearing2Months = diffDays >= 60; // Time to reset
  const shouldReset = diffDays >= 60;
  
  return {
    days: diffDays,
    months: diffMonths,
    isNearing1Month,
    isNearing2Months,
    shouldReset,
  };
}

export function hasNotificationBeenSent(): boolean {
  const config = getRetentionConfig();
  return config.notificationSent;
}

export function markNotificationSent() {
  updateRetentionConfig({
    lastNotifiedAt: new Date().toISOString(),
    notificationSent: true,
  });
}

export function getDataRetentionStatus(): {
  status: 'active' | 'warning' | 'critical' | 'reset-due';
  message: string;
  daysRemaining: number;
} {
  const age = getDataAge();
  
  if (age.shouldReset) {
    return {
      status: 'reset-due',
      message: 'Data retention period (2 months) has expired. Data will be reset.',
      daysRemaining: 0,
    };
  }
  
  if (age.isNearing1Month && !hasNotificationBeenSent()) {
    return {
      status: 'warning',
      message: 'Data will be reset in 30 days. Please download all records as Excel.',
      daysRemaining: 60 - age.days,
    };
  }
  
  if (age.isNearing2Months) {
    return {
      status: 'critical',
      message: 'Data will be reset very soon (within 2 months). Final download required.',
      daysRemaining: 60 - age.days,
    };
  }
  
  return {
    status: 'active',
    message: `Data is active. Retention expires in ${60 - age.days} days.`,
    daysRemaining: 60 - age.days,
  };
}
