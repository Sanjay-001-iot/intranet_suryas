import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for guest activities (replace with database in production)
let guestActivities: any[] = [];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ activities: guestActivities });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch guest activities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, guestId, guestName, email, phone, loginTime, logoutTime, pagesVisited } = body;

    if (action === 'login') {
      // Record guest login
      const activity = {
        id: guestId || `guest-${Date.now()}`,
        guestName,
        email: email || 'Not provided',
        phone: phone || 'Not provided',
        loginTime,
        logoutTime: null,
        sessionDuration: null,
        pagesVisited: pagesVisited || [],
        status: 'active',
      };

      guestActivities.unshift(activity);

      // Send notifications to admin and founder only
      await fetch(`${request.nextUrl.origin}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'guest_login',
          title: 'Guest Login',
          message: `${guestName} has logged in`,
          targetUser: 'admin',
          relatedId: activity.id,
        }),
      });

      await fetch(`${request.nextUrl.origin}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'guest_login',
          title: 'Guest Login',
          message: `${guestName} has logged in`,
          targetUser: 'founder',
          relatedId: activity.id,
        }),
      });

      return NextResponse.json({ success: true, activity });
    }

    if (action === 'logout') {
      // Update guest logout
      const index = guestActivities.findIndex((a) => a.id === guestId);
      if (index !== -1) {
        const loginMs = new Date(guestActivities[index].loginTime).getTime();
        const logoutMs = new Date(logoutTime).getTime();
        const durationMins = Math.floor((logoutMs - loginMs) / 60000);

        guestActivities[index].logoutTime = logoutTime;
        guestActivities[index].sessionDuration = `${durationMins} minutes`;
        guestActivities[index].status = 'logged_out';

        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: 'Guest activity not found' }, { status: 404 });
    }

    if (action === 'update_pages') {
      // Update pages visited
      const index = guestActivities.findIndex((a) => a.id === guestId);
      if (index !== -1) {
        guestActivities[index].pagesVisited = pagesVisited;
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: 'Guest activity not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record guest activity' }, { status: 500 });
  }
}
