import { NextRequest, NextResponse } from 'next/server';

export interface Circular {
  id: string;
  title: string;
  content: string;
  postedBy: string;
  postedByRole: string;
  postedAt: string;
  recipients: string[];
  priority: 'low' | 'medium' | 'high';
  meta?: {
    date?: string;
    time?: string;
    category?: string;
  };
}

const circulars: Circular[] = [];

export async function GET(_request: NextRequest) {
  return NextResponse.json({ success: true, circulars });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, postedBy, postedByRole, priority = 'medium', meta } = body;

    if (!title || !content || !postedBy || !postedByRole) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const circular: Circular = {
      id: `circular-${Date.now()}`,
      title,
      content,
      postedBy,
      postedByRole,
      postedAt: new Date().toISOString(),
      recipients: ['all'], // Will be sent to all users
      priority,
      meta,
    };

    circulars.unshift(circular);
    return NextResponse.json({ success: true, circular });
  } catch (error) {
    console.error('Error creating circular:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json(
        { error: 'Missing id or updates' },
        { status: 400 }
      );
    }

    const index = circulars.findIndex((c) => c.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Circular not found' }, { status: 404 });
    }

    circulars[index] = {
      ...circulars[index],
      ...updates,
      content: updates.details ?? updates.content ?? circulars[index].content,
      meta: {
        ...circulars[index].meta,
        date: updates.date ?? circulars[index].meta?.date,
        time: updates.time ?? circulars[index].meta?.time,
        category: updates.category ?? circulars[index].meta?.category,
      },
    };

    return NextResponse.json({ success: true, circular: circulars[index] });
  } catch (error) {
    console.error('Error updating circular:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
