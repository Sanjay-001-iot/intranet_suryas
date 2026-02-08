import { NextRequest, NextResponse } from 'next/server';

interface GuestInquiry {
  id: string;
  guestName: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  time: string;
  status: 'new' | 'read' | 'resolved';
  createdAt: string;
}

const inquiries: GuestInquiry[] = [];

export async function GET(request: NextRequest) {
  return NextResponse.json({ success: true, inquiries });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guestName, email, subject, message } = body;

    if (!guestName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const now = new Date();
    const inquiry: GuestInquiry = {
      id: `inquiry-${Date.now()}`,
      guestName,
      email,
      subject,
      message,
      date: now.toLocaleDateString('en-IN'),
      time: now.toLocaleTimeString('en-IN'),
      status: 'new',
      createdAt: now.toISOString(),
    };

    inquiries.unshift(inquiry);
    return NextResponse.json({ success: true, inquiry });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
