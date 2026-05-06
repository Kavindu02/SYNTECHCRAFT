'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only track actual pages, ignore api/static files
    if (pathname && !pathname.startsWith('/api/') && !pathname.startsWith('/admin/')) {
      const trackVisit = async () => {
        try {
          await fetch('/api/analytics/track', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pathname,
              searchParams: searchParams?.toString() || '',
              referrer: document.referrer,
              screenResolution: `${window.screen.width}x${window.screen.height}`,
              userAgent: navigator.userAgent,
            }),
          });
        } catch (error) {
          console.error('Analytics tracking failed:', error);
        }
      };

      trackVisit();
    }
  }, [pathname, searchParams]);

  return null;
}
