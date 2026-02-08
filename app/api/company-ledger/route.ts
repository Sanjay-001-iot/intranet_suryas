import { NextResponse } from 'next/server';
import { getCompanyLedger } from '@/lib/company-ledger';

export async function GET() {
  try {
    const ledger = getCompanyLedger();
    return NextResponse.json({ success: true, ledger });
  } catch (error) {
    console.error('Company ledger fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch company ledger' }, { status: 500 });
  }
}