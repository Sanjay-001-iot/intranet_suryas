import { NextRequest, NextResponse } from 'next/server';
import { RequestItem, RequestTarget, RequestType, UploadedFile } from '@/lib/request-store';
import { addRequestDB, getRequestsByTargetDB } from '@/lib/request-db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const target = (searchParams.get('target') || 'admin') as RequestTarget;
  const items = getRequestsByTargetDB(target);
  return NextResponse.json({ success: true, requests: items });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      title,
      createdBy,
      createdById,
      createdByRole,
      createdByDesignation,
      payload,
      target,
      uploadedFile,
      signatureFrom,
    } = body as {
      type: RequestType;
      title: string;
      createdBy: string;
      createdById?: string;
      createdByRole?: string;
      createdByDesignation?: string;
      payload: Record<string, any>;
      target: RequestTarget;
      uploadedFile?: UploadedFile;
      signatureFrom?: string;
    };

    if (!type || !title || !createdBy || !payload || !target) {
      return NextResponse.json({ error: 'Missing request data' }, { status: 400 });
    }

    const newRequest: RequestItem = {
      id: `req-${Date.now()}`,
      type,
      title,
      createdBy,
      createdById,
      createdByRole,
      createdByDesignation,
      payload,
      target,
      status: 'pending',
      createdAt: new Date().toISOString(),
      uploadedFile,
      signatureFrom,
    };

    const saved = addRequestDB(newRequest);

    return NextResponse.json({ success: true, request: saved });
  } catch (error) {
    console.error('Request creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
