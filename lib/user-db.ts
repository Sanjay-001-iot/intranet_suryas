import fs from 'fs';
import path from 'path';
import { StoredUser } from './user-database';

const DB_FILE = path.join(process.cwd(), '.data', 'users.json');

function ensureDBDir() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readDB(): StoredUser[] {
  try {
    ensureDBDir();
    if (!fs.existsSync(DB_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data) || [];
  } catch (error) {
    console.error('Error reading user DB:', error);
    return [];
  }
}

function writeDB(users: StoredUser[]) {
  try {
    ensureDBDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error writing user DB:', error);
  }
}

export function saveUsersToDB(users: StoredUser[]) {
  writeDB(users);
}

export function loadUsersFromDB(): StoredUser[] {
  return readDB();
}

export function updateUserInDB(id: string, updates: Partial<StoredUser>) {
  const users = readDB();
  const index = users.findIndex((u) => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    writeDB(users);
    return users[index];
  }
  return undefined;
}

export function updateUserByUsernameInDB(username: string, updates: Partial<StoredUser>) {
  const users = readDB();
  const index = users.findIndex((u) => u.username === username);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    writeDB(users);
    return users[index];
  }
  return undefined;
}
