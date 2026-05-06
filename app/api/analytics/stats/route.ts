import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';

export async function GET() {
  try {
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
    const recentVisits = await db.collection('analytics_visits')
      .find({})
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    const formattedRecentVisits = recentVisits.map(visit => ({
      id: visit._id.toString(),
      userAgent: visit.userAgent,
      timestamp: visit.timestamp,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalVisits,
        uniqueVisitors,
        todayVisits,
        recentVisits: formattedRecentVisits,
      }
    });
  } catch (error) {
    console.error('Failed to fetch analytics stats:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics stats' }, { status: 500 });
  }
}
