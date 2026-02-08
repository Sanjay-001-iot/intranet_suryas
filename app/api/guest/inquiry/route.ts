import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for guest inquiries
let guestInquiries: Array<{
  id: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  subject: string;
  message: string;
  timestamp: string;
  status: 'new' | 'read' | 'resolved';
}> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guestId, guestName, guestEmail, subject, message, timestamp } = body;

    if (!guestId || !guestName || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new inquiry
    const newInquiry = {
      id: `INQ-${Date.now()}`,
      guestId,
      guestName,
      guestEmail,
      subject,
      message,
      timestamp,
      status: 'new' as const,
    };

    guestInquiries.push(newInquiry);

    return NextResponse.json(
      {
        success: true,
        message: 'Inquiry submitted successfully',
        inquiry: newInquiry,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to process inquiry' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return all inquiries
    return NextResponse.json(
      {
        inquiries: guestInquiries,
        total: guestInquiries.length,
        newCount: guestInquiries.filter((i) => i.status === 'new').length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}
