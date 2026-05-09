import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFilter = searchParams.get('date');
    
    const db = await getMongoDb();
    
    // Total visits
    const totalVisits = await db.collection('analytics_visits').countDocuments();

    // Today visits
    const today = new Date().toISOString().split('T')[0];
    const todayVisits = await db.collection('analytics_visits').countDocuments({ dateStr: today });

    // Unique visitors (by IP)
    const uniqueVisitorsResult = await db.collection('analytics_visits').aggregate([
      { $group: { _id: "$ip" } },
      { $count: "count" }
    ]).toArray();
    const uniqueVisitors = uniqueVisitorsResult.length > 0 ? uniqueVisitorsResult[0].count : 0;

    // Recent visits
    const query = dateFilter ? { dateStr: dateFilter } : {};
    const recentVisits = await db.collection('analytics_visits')
      .find(query)
      .sort({ timestamp: -1 })
      .limit(500)
      .toArray();

    const formattedRecentVisits = recentVisits.map(visit => ({
      id: visit._id.toString(),
      userAgent: visit.userAgent,
      timestamp: visit.timestamp,
    }));

    // Count for the filtered date if provided
    let filteredCount = null;
    if (dateFilter) {
      filteredCount = await db.collection('analytics_visits').countDocuments({ dateStr: dateFilter });
    }

    return NextResponse.json({
      success: true,
      data: {
        totalVisits,
        uniqueVisitors,
        todayVisits,
        recentVisits: formattedRecentVisits,
        filteredCount,
      }
    });
  } catch (error) {
    console.error('Failed to fetch analytics stats:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics stats' }, { status: 500 });
  }
}
