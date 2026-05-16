import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MLV PG Services – Premium Student PG Near Acharya Institute',
  description:
    'Premium student PG near Acharya Institute with unlimited food, 24/7 electricity, WiFi, CCTV security, and parent-like care. Best accommodation for students in Bangalore.',
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

