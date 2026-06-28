import { NextResponse } from 'next/server';

export async function GET() {
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
  const PLACE_ID = process.env.GOOGLE_PLACE_ID;

  if (!API_KEY || !PLACE_ID) {
    return NextResponse.json({ error: 'Google Places API credentials not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${PLACE_ID}`,
      {
        headers: {
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'reviews'
        },
        next: { revalidate: 3600 * 24 } // Cache for 24 hours
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google API Error Response:', errorText);
      throw new Error('Failed to fetch from Google Places API (New)');
    }

    const data = await response.json();
    const reviews = data.reviews || [];
    
    // Format the reviews to match our frontend interface
    const formattedReviews = reviews.map((review: any) => ({
      name: review.authorAttribution?.displayName || 'Google User',
      role: review.relativePublishTimeDescription || 'Google Review',
      text: review.text?.text || review.originalText?.text || '',
      rating: review.rating || 5,
      profilePhoto: review.authorAttribution?.photoUri || '',
    }));

    return NextResponse.json({ reviews: formattedReviews });
  } catch (error) {
    console.error('Error fetching Google Reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
