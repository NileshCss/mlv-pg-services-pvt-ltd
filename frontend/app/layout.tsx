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
  metadataBase: new URL('https://mlv-pg-services-pvt-ltd-frontend.vercel.app'),

  title: {
    default: 'MLV PG Services – Best Student PG Near Acharya Institute Bangalore',
    template: '%s | MLV PG Services',
  },

  description:
    'MLV PG Services offers premium student PG accommodation near Acharya Institute of Technology, Bangalore. Unlimited food, WiFi, CCTV, 24/7 electricity. Rooms from ₹7,500/month.',

  keywords: [
    'PG near Acharya Institute',
    'student PG Bangalore',
    'boys PG Bangalore',
    'girls PG Bangalore',
    'PG with food Bangalore',
    'cheap PG near Acharya Institute',
    'MLV PG Services',
    'paying guest Bangalore',
    'student accommodation Bangalore',
    'PG near Soladevanahalli',
    'PG Hesaraghatta Road Bangalore',
  ],

  authors: [{ name: 'MLV PG Services' }],
  creator: 'MLV PG Services',
  publisher: 'MLV PG Services',

  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://mlv-pg-services-pvt-ltd-frontend.vercel.app',
    siteName: 'MLV PG Services',
    title: 'MLV PG Services – Premium Student PG Near Acharya Institute',
    description:
      'Best student PG in Bangalore near Acharya Institute. Unlimited food, WiFi, CCTV, power backup. Rooms from ₹7,500/month.',
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
    title: 'MLV PG Services – Premium Student PG Bangalore',
    description:
      'Best student PG near Acharya Institute Bangalore. Unlimited food, WiFi, CCTV. Rooms from ₹7,500/month.',
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
    google: 'rD7eAGYg6VWx8leXLSqhHETZK0noWwYzaje51kig3vA', // get from Google Search Console
  },

  alternates: {
    canonical: 'https://mlv-pg-services-pvt-ltd-frontend.vercel.app',
  },
};

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

