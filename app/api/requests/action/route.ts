import { NextRequest, NextResponse } from 'next/server';
import { getRequestByIdDB, updateRequestStatusDB } from '@/lib/request-db';
import { addLedgerTransaction } from '@/lib/company-ledger';

const isIntern = (designation?: string) =>
  !!designation && designation.toLowerCase().includes('intern');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, requestId } = body as { action: 'approve' | 'reject' | 'sign'; requestId: string };

    if (!action || !requestId) {
      return NextResponse.json({ error: 'Missing action or requestId' }, { status: 400 });
    }

    const current = getRequestByIdDB(requestId);
    if (!current) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (action === 'approve') {
      if (current.type === 'ta' || current.type === 'proposal') {
        const rawAmount = current.type === 'ta'
          ? current.payload?.amount
          : current.payload?.projectAmount;
        const amount = Number(rawAmount);
        if (!Number.isFinite(amount) || amount <= 0) {
          return NextResponse.json({ error: 'Invalid amount for approval' }, { status: 400 });
        }

        const purpose = current.type === 'ta'
          ? (current.payload?.description || 'Allowance Claim')
          : (current.payload?.projectTitle || 'Project Approval');
        const remarks = current.type === 'ta'
          ? (current.payload?.claimType || current.payload?.billFileName || '')
          : '';

        addLedgerTransaction({
          amount,
          purpose,
          remarks,
          type: current.type === 'ta' ? 'debited' : 'credited',
          requestId: current.id,
          requestType: current.type,
        });

        const updated = updateRequestStatusDB(requestId, 'approved');
        return NextResponse.json({ success: true, request: updated });
      }

      const forwardedTo = current.signatureFrom === 'Hareesh' || isIntern(current.createdByDesignation)
        ? 'Hareesh'
        : 'Founder';
      const target = forwardedTo === 'Founder' ? 'founder' : 'admin';
      const updated = updateRequestStatusDB(requestId, 'forwarded', {
        target,
        forwardedTo,
        signatureStatus: 'pending',
      });
      return NextResponse.json({ success: true, request: updated, forwardedTo });
    }

    if (action === 'reject') {
      const updated = updateRequestStatusDB(requestId, 'rejected');
      return NextResponse.json({ success: true, request: updated });
    }

    if (action === 'sign') {
      const forwardedTo = current.signatureFrom === 'Hareesh' || isIntern(current.createdByDesignation)
        ? 'Hareesh'
        : 'Admin';
      const updated = updateRequestStatusDB(requestId, 'signed', {
        signatureStatus: 'signed',
        target: 'admin',
        forwardedTo,
      });
      return NextResponse.json({ success: true, request: updated, forwardedTo });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Request action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
