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
  metadataBase: new URL('https://mlvpg.com'),

  title: {
    // ≤60 chars: "MLV PG | Acharya College | North Indian Food"
    default: 'MLV PG | Acharya College | North Indian Food',
    template: '%s | MLV PG Services',
  },

  description:
    'MLV PG near Acharya Institute of Technology, Acharya Institute of Graduate Studies & Acharya College, Bangalore. Authentic North Indian home-cooked food, hygienic kitchen, parent-like care. Safe PG for boys & girls from ₹7,500/month.',

  keywords: [
    'PG near Acharya College',
    'PG near Acharya Institute of Technology',
    'PG near Acharya Institute of Graduate Studies',
    'North Indian PG near Acharya',
    'MLV PG',
    'MLV PG Services',
    'North Indian food PG Bangalore',
    'PG with home-cooked food near Acharya',
    'student PG Bangalore',
    'boys PG near Acharya Institute',
    'girls PG near Acharya Institute Bangalore',
    'safe PG for girls Bangalore',
    'PG near Soladevanahalli',
    'PG Hesaraghatta Road Bangalore',
    'affordable PG near Acharya Institute',
    'paying guest near Acharya Bangalore',
  ],

  authors: [{ name: 'MLV PG Services Pvt Ltd' }],
  creator: 'MLV PG Services Pvt Ltd',
  publisher: 'MLV PG Services Pvt Ltd',

  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://mlvpg.com',
    siteName: 'MLV PG Services',
    title: 'MLV PG – North Indian Food PG near Acharya College Bangalore',
    description:
      'Authentic North Indian home-cooked food, hygienic kitchen & parent-like care. MLV PG is walking distance from Acharya Institute of Technology, Acharya Institute of Graduate Studies & Acharya College. Safe for boys & girls.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'MLV PG Services – North Indian PG near Acharya Institute Bangalore',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'MLV PG – North Indian Food PG near Acharya College Bangalore',
    description:
      'Authentic North Indian home-cooked food & parent-like care. Walking distance from Acharya Institute of Technology, AIGS & Acharya College. Safe for boys & girls.',
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
    google: 'rD7eAGYg6VWx8leXLSqhHETZK0noWwYzaje51kig3vA',
  },

  alternates: {
    canonical: 'https://mlvpg.com',
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

