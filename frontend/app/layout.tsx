import type { Metadata } from 'next'
import { Playfair_Display, Inter, Poppins } from 'next/font/google'
import '../styles/globals.css'
import { Toaster } from 'sonner'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

import SchemaMarkup from '../components/SEO/SchemaMarkup'

export const metadata: Metadata = {
  title: 'MLV PG Services – Best Student PG Near Acharya Institute Bangalore',
  description:
    'MLV PG Services offers premium student PG near Acharya Institute Bangalore. Boys and girls PG on Hesaraghatta Road with unlimited food, WiFi, and safety. Best cheap PG near Acharya Institute.',
  keywords: [
    'PG near Acharya Institute Bangalore',
    'student PG Bangalore with food',
    'boys girls PG Hesaraghatta Road',
    'cheap PG near Acharya Institute',
    'MLV PG Services Bangalore',
    'Acharya Institute of Technology PG',
    'Student accommodation Bangalore',
  ],
  authors: [{ name: 'MLV PG Services' }],
  metadataBase: new URL('https://mlv-pg-services-pvt-ltd-frontend.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'MLV PG Services – Premium Student PG Bangalore',
    description: 'Premium student accommodation near Acharya Institute with food, WiFi, and 24/7 security.',
    url: 'https://mlv-pg-services-pvt-ltd-frontend.vercel.app',
    siteName: 'MLV PG Services',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'MLV PG Services Bangalore',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MLV PG Services – Student PG Near Acharya Institute',
    description: 'Best student PG in Bangalore with food and safety.',
    images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80'],
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
  verification: {
    google: 'google-site-verification-placeholder',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#C9A84C" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${playfair.variable} ${inter.variable} ${poppins.variable} bg-white text-[#1A1A2E]`}>
        <SchemaMarkup />
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}

