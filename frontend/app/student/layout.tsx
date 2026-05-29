import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Student Dashboard | MLV PG Services',
  description: 'Access your MLV PG student portal — fees, room info, complaints, notices, and more.',
  robots: { index: false, follow: false },
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
