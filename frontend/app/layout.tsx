import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import '../styles/globals.css'
import { Toaster } from 'sonner'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '600', '700'],
  display: 'swap', // Prevent FOUT
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600'],
  display: 'swap', // Prevent FOUT
})

export const metadata: Metadata = {
  title: 'MLV PG Services – Premium Student PG Near Acharya Institute',
  description:
    'Premium student PG near Acharya Institute with unlimited food, 24/7 electricity, WiFi, CCTV security, and parent-like care. Best accommodation for students in Bangalore.',
  keywords: [
    'PG near Acharya Institute',
    'Student PG Bangalore',
    'Unlimited food PG',
    'Boys PG',
    'Girls PG',
    'Student accommodation',
  ],
  openGraph: {
    title: 'MLV PG Services – Premium Student PG',
    description: 'Your home away from home in Bangalore',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'MLV PG Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MLV PG Services',
    description: 'Premium Student PG Near Acharya Institute',
  },
  robots: {
    index: true,
    follow: true,
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
        <meta name="theme-color" content="#0d1b85" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${playfair.variable} ${dmSans.variable} bg-dark-900 text-gray-50`}>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
