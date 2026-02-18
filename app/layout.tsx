import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'
import { Toaster } from "@/components/ui/sonner"
import { ScrollToTop } from '@/components/scroll-to-top'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'SDK Solutions | Software Development House',
  description: 'Next-gen software development, web apps, and mobile solutions by SDK Solutions.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased text-slate-900 bg-white`} suppressHydrationWarning>
        {children}
        <Toaster />
        <ScrollToTop />
      </body>
    </html>
  )
}
