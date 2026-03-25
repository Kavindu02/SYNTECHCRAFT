import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'
import { Toaster } from "@/components/ui/sonner"
import { ScrollToTop } from '@/components/scroll-to-top'
import { InitialLoader } from '@/components/initial-loader'
import { RouteTransitionLoader } from '@/components/route-transition-loader'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: {
    default: 'SYNTECHCRAFT | Innovating Your Future | Best Software Agency in Sri Lanka',
    template: '%s | SYNTECHCRAFT'
  },
  description: 'SYNTECHCRAFT is a premier software development agency in Sri Lanka specializing in modern web development, mobile apps, UI/UX design, and cloud solutions. We turn complex challenges into seamless digital experiences.',
  keywords: [
    'SYNTECHCRAFT',
    'Software Development Sri Lanka',
    'Web Development Colombo',
    'Mobile App Development',
    'UI/UX Design Agency',
    'Cloud Solutions',
    'Custom Software Development',
    'React Developers Sri Lanka',
    'Next.js Agency',
    'Tech Solutions Sri Lanka'
  ],
  authors: [{ name: 'SYNTECHCRAFT' }],
  creator: 'SYNTECHCRAFT',
  publisher: 'SYNTECHCRAFT',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://syntechcraft.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SYNTECHCRAFT | Innovating Your Future',
    description: 'Premier software development agency specializing in modern web, mobile, and custom solutions.',
    url: 'https://syntechcraft.com',
    siteName: 'SYNTECHCRAFT',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
        alt: 'SYNTECHCRAFT Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SYNTECHCRAFT | Innovating Your Future',
    description: 'Modern web, mobile and custom software solutions for growing businesses.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased text-slate-900 bg-white`} suppressHydrationWarning>
        <InitialLoader />
        <RouteTransitionLoader />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "SYNTECHCRAFT",
              "url": "https://syntechcraft.com",
              "logo": "https://syntechcraft.com/logo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+94-74-2216-579",
                "contactType": "customer service",
                "areaServed": "LK",
                "availableLanguage": ["en", "si"]
              },
              "sameAs": [
                "https://www.facebook.com/share/17hZxJtcym/?mibextid=wwXIfr",
                "https://www.linkedin.com/company/syntechcraft/posts/?feedView=all"
              ]
            })
          }}
        />
        {children}
        <Toaster />
        <ScrollToTop />
      </body>
    </html>
  )
}
