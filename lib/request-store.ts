export type RequestTarget = 'admin' | 'founder' | 'all';
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'signed' | 'forwarded';
export type RequestType = 'leave' | 'ta' | 'proposal' | 'report' | 'recruitment' | 'certificate';

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  base64: string;
  uploadedAt: string;
}

export interface RequestItem {
  id: string;
  type: RequestType;
  title: string;
  createdBy: string;
  createdById?: string;
  createdByRole?: string;
  createdByDesignation?: string;
  payload: Record<string, any>;
  target: RequestTarget;
  status: RequestStatus;
  createdAt: string;
  updatedAt?: string;
  forwardedTo?: string;
  uploadedFile?: UploadedFile;
  signatureFrom?: string;
  signatureStatus?: 'pending' | 'signed' | 'rejected';
  circular?: {
    title: string;
    content: string;
    recipients: string[];
  };
}

const requests: RequestItem[] = [];

export function addRequest(request: RequestItem): RequestItem {
  requests.unshift(request);
  return request;
}

export function getRequestsByTarget(target: RequestTarget): RequestItem[] {
  if (target === 'all') {
    return [...requests];
  }
  return requests.filter((req) => req.target === target);
}

export function getRequestById(id: string): RequestItem | undefined {
  return requests.find((req) => req.id === id);
}

export function updateRequestStatus(id: string, status: RequestStatus, updates?: Partial<RequestItem>): RequestItem | undefined {
  const index = requests.findIndex((req) => req.id === id);
  if (index !== -1) {
    requests[index] = {
      ...requests[index],
      status,
      updatedAt: new Date().toISOString(),
      ...updates,
    };
    return requests[index];
  }
  return undefined;
}
