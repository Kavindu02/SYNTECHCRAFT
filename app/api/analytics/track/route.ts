import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pathname, searchParams, referrer, screenResolution, userAgent } = body;

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown';
    const timestamp = new Date();

    const db = await getMongoDb();
    
    // Create 'analytics_visits' collection if it doesn't exist (MongoDB does this automatically on insert)
    await db.collection('analytics_visits').insertOne({
      pathname,
      searchParams,
      referrer,
      screenResolution,
      userAgent,
      ip,
      timestamp,
      // Grouping by day for easy daily stats
      dateStr: timestamp.toISOString().split('T')[0],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to track visit:', error);
    return NextResponse.json({ error: 'Failed to track visit' }, { status: 500 });
  }
}
