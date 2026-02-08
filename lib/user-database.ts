// Simple in-memory user storage (can be replaced with PostgreSQL)
// For production, use a real database

export interface StoredUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user' | 'guest' | 'founder';
  fullName: string;
  phone?: string;
  profilePhoto?: string;
  profilePictureUploaded?: boolean;
  designation?: string;
  status?: 'pending_approval' | 'active' | 'rejected';
  requestedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  emailVerified?: boolean;
  verificationToken?: string;
  verificationSentAt?: string;
  resetToken?: string;
  resetTokenExpiresAt?: string;
  createdAt: string;
  isProfileCompleted?: boolean;
  profileCompletedAt?: string;
  selectedRole?: string;
}

// In-memory database (in production, use PostgreSQL)
// User credentials:
// GollaKumar: FounderGK@123
// JayendranM: AdminJ@123
// lash: lash@123
// hareesh: hareesh@123
// SanthanaKumar: santhaK@123

// Default users (fallback if file DB is empty)
const defaultUsers: StoredUser[] = [
  {
    id: 'founder-001',
    username: 'GollaKumar',
    email: 'proprietor@suryas.in',
    passwordHash: '$2b$10$uaeHqtPjTCdWPmri.kycv.3pOvM9KQ3qPQ6QmfPukiJPF7UO5tQUm', // bcrypt hash of 'FounderGK@123'
    role: 'founder',
    fullName: 'Golla Kumar Bharath',
    designation: 'Founder',
    profilePictureUploaded: true,
    status: 'active',
    emailVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'admin-001',
    username: 'JayendranM',
    email: 'administrator@suryas.in',
    passwordHash: '$2b$10$A.z1osls5i5HMnp9owYh5eIohiEFcb8Txj8AfhiLZwqZ.fC6scGde', // bcrypt hash of 'AdminJ@123'
    role: 'admin',
    fullName: 'Jayendra M',
    designation: 'Administrator',
    profilePictureUploaded: true,
    status: 'active',
    emailVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-001',
    username: 'lash',
    email: 'lash@example.com',
    passwordHash: '$2b$10$DhUKPCgy/m9kL079sbvUL.Zfcy0dlDbjFDmcZTpsltfAqBXd/ZxDy', // bcrypt hash of 'lash@123'
    role: 'user',
    fullName: 'Lashmini',
    designation: 'Employee',
    profilePictureUploaded: false,
    status: 'active',
    emailVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-002',
    username: 'hareesh',
    email: 'hareesh@suryas.in',
    passwordHash: '$2b$10$lrUMdDaiocF683vZgrPikOT7ucILBjJ26hv6ai0sk51M5RyaSPB.O', // bcrypt hash of 'hareesh@123'
    role: 'user',
    fullName: 'Hareesh',
    designation: 'Technical Team',
    profilePictureUploaded: false,
    status: 'active',
    emailVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-003',
    username: 'SanthanaKumar',
    email: 'santhana@suryas.in',
    passwordHash: '$2b$10$ShL20DIS/JFjb7avMWa0zetnpg.xLoaFSaWYWINxYX.KfmW/av0zO', // bcrypt hash of 'santhaK@123'
    role: 'user',
    fullName: 'Santhana Kumar',
    designation: 'Technical Team Head',
    profilePictureUploaded: false,
    status: 'active',
    emailVerified: true,
    createdAt: new Date().toISOString(),
  },
];

// Initialize from file DB or use defaults
function initializeUsers(): StoredUser[] {
  try {
    const { loadUsersFromDB } = require('./user-db');
    const loaded = loadUsersFromDB();
    if (loaded && loaded.length > 0) {
      console.log('[USER-DB-INIT] Loaded', loaded.length, 'users from file DB');
      return loaded;
    }
  } catch (err) {
    console.log('[USER-DB-INIT] Could not load from file, using defaults');
  }
  return defaultUsers;
}

let users: StoredUser[] = initializeUsers();

export function findUserByUsername(username: string): StoredUser | undefined {
  // First check in-memory
  let user = users.find((u) => u.username === username || u.email === username);
  
  // If not found or to ensure we have the latest version, also check file DB
  try {
    const { loadUsersFromDB } = require('./user-db');
    const fileUsers = loadUsersFromDB();
    if (fileUsers && fileUsers.length > 0) {
      const fileUser = fileUsers.find((u: StoredUser) => u.username === username || u.email === username);
      if (fileUser) {
        // Update in-memory with latest from file
        const index = users.findIndex((u) => u.id === fileUser.id);
        if (index !== -1) {
          users[index] = fileUser;
        } else {
          users.push(fileUser);
        }
        return fileUser;
      }
    }
  } catch (err) {
    // Fallback to in-memory
  }
  
  return user;
}

export function findUserById(id: string): StoredUser | undefined {
  // First check in-memory
  let user = users.find((u) => u.id === id);
  
  // If not found or to ensure we have the latest version, also check file DB
  try {
    const { loadUsersFromDB } = require('./user-db');
    const fileUsers = loadUsersFromDB();
    if (fileUsers && fileUsers.length > 0) {
      const fileUser = fileUsers.find((u: StoredUser) => u.id === id);
      if (fileUser) {
        // Update in-memory with latest from file
        const index = users.findIndex((u) => u.id === id);
        if (index !== -1) {
          users[index] = fileUser;
        } else {
          users.push(fileUser);
        }
        return fileUser;
      }
    }
  } catch (err) {
    // Fallback to in-memory
  }
  
  return user;
}

export function findUserByVerificationToken(token: string): StoredUser | undefined {
  // First check in-memory
  let user = users.find((u) => u.verificationToken === token);
  
  // Also check file DB
  try {
    const { loadUsersFromDB } = require('./user-db');
    const fileUsers = loadUsersFromDB();
    if (fileUsers && fileUsers.length > 0) {
      const fileUser = fileUsers.find((u: StoredUser) => u.verificationToken === token);
      if (fileUser) {
        const index = users.findIndex((u) => u.id === fileUser.id);
        if (index !== -1) {
          users[index] = fileUser;
        } else {
          users.push(fileUser);
        }
        return fileUser;
      }
    }
  } catch (err) {
    // Fallback to in-memory
  }
  
  return user;
}

export function findUserByResetToken(token: string): StoredUser | undefined {
  // First check in-memory
  let user = users.find((u) => u.resetToken === token && !!u.resetTokenExpiresAt);
  
  // Also check file DB
  try {
    const { loadUsersFromDB } = require('./user-db');
    const fileUsers = loadUsersFromDB();
    if (fileUsers && fileUsers.length > 0) {
      const fileUser = fileUsers.find((u: StoredUser) => u.resetToken === token && !!u.resetTokenExpiresAt);
      if (fileUser) {
        const index = users.findIndex((u) => u.id === fileUser.id);
        if (index !== -1) {
          users[index] = fileUser;
        } else {
          users.push(fileUser);
        }
        return fileUser;
      }
    }
  } catch (err) {
    // Fallback to in-memory
  }
  
  return user;
}

export function addUser(user: StoredUser): StoredUser {
  users.push(user);
  return user;
}

export function getAllUsers(): StoredUser[] {
  return users;
}

export function getPendingUsers(): StoredUser[] {
  console.log('[getPendingUsers] Total users in DB:', users.length);
  users.forEach(u => console.log('  - User:', u.username, 'Status:', u.status));
  const pending = users.filter((u) => u.status === 'pending_approval');
  console.log('[getPendingUsers] Pending users found:', pending.length);
  return pending;
}

export function isUsernameTaken(username: string): boolean {
  return !!findUserByUsername(username);
}

export function approveUser(userId: string, username?: string, passwordHash?: string, updates?: Partial<StoredUser>): StoredUser | undefined {
  const index = users.findIndex((u) => u.id === userId);
  if (index !== -1) {
    users[index] = {
      ...users[index],
      username: username || users[index].username,
      passwordHash: passwordHash || users[index].passwordHash,
      status: 'active',
      approvedAt: new Date().toISOString(),
      ...updates,
    };
    return users[index];
  }
  return undefined;
}

export function denyUser(userId: string): boolean {
  const initial = users.length;
  users = users.filter((u) => u.id !== userId);
  return users.length !== initial;
}

export function updateUser(username: string, updates: Partial<StoredUser>): StoredUser | undefined {
  const index = users.findIndex((u) => u.username === username);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    return users[index];
  }
  return undefined;
}

export function updateUserById(userId: string, updates: Partial<StoredUser>): StoredUser | undefined {
  const index = users.findIndex((u) => u.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    return users[index];
  }
  return undefined;
}
