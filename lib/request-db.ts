import fs from 'fs';
import path from 'path';
import { RequestItem } from './request-store';

const DB_FILE = path.join(process.cwd(), '.data', 'requests.json');

function ensureDBDir() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readDB(): RequestItem[] {
  try {
    ensureDBDir();
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data) || [];
  } catch (error) {
    console.error('Error reading request DB:', error);
    return [];
  }
}

function writeDB(requests: RequestItem[]) {
  try {
    ensureDBDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(requests, null, 2));
  } catch (error) {
    console.error('Error writing request DB:', error);
  }
}

export function addRequestDB(request: RequestItem): RequestItem {
  const requests = readDB();
  requests.unshift(request);
  writeDB(requests);
  return request;
}

export function getRequestsByTargetDB(target: 'admin' | 'founder' | 'all'): RequestItem[] {
  const requests = readDB();
  if (target === 'all') {
    return [...requests];
  }
  return requests.filter((req) => req.target === target);
}

export function getRequestByIdDB(id: string): RequestItem | undefined {
  const requests = readDB();
  return requests.find((req) => req.id === id);
}

export function updateRequestStatusDB(
  id: string,
  status: 'pending' | 'approved' | 'rejected' | 'signed' | 'forwarded',
  updates?: Partial<RequestItem>
): RequestItem | undefined {
  const requests = readDB();
  const index = requests.findIndex((req) => req.id === id);
  if (index !== -1) {
    requests[index] = {
      ...requests[index],
      status,
      updatedAt: new Date().toISOString(),
      ...updates,
    };
    writeDB(requests);
    return requests[index];
  }
  return undefined;
}
