'use client'

import React, { useState, useEffect, useCallback } from 'react'

interface Notice {
  id: string
  text: string
  emoji: string
  is_active: boolean
  order: number
}

const FALLBACK_NOTICES: Notice[] = [
  { id: '1', text: 'New rooms now available – Limited seats!', emoji: '🏠', is_active: true, order: 1 },
  { id: '2', text: 'Updated Food Menu for this month is live', emoji: '🍽️', is_active: true, order: 2 },
  { id: '3', text: 'Pre-Registration open for 2026 batch', emoji: '📋', is_active: true, order: 3 },
  { id: '4', text: 'Contact us: +91 8809630649', emoji: '📞', is_active: true, order: 4 },
  { id: '5', text: 'WiFi upgraded to 1 Gbps across all floors', emoji: '✅', is_active: true, order: 5 },
]

const REFRESH_INTERVAL = 5 * 60 * 1000

export const NoticeTicker: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>(FALLBACK_NOTICES)

  const fetchNotices = useCallback(async () => {
    try {
      const res = await fetch('/api/notices', { cache: 'no-store' })
      if (!res.ok) throw new Error('fetch failed')
      const { data } = await res.json()
      const active = (data as Notice[]).filter(n => n.is_active).sort((a, b) => a.order - b.order)
      if (active.length > 0) setNotices(active)
    } catch {
      // keep fallback
    }
  }, [])

  useEffect(() => {
    fetchNotices()
    const interval = setInterval(fetchNotices, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchNotices])

  if (notices.length === 0) return null

  const noticeText = notices.map(n => `${n.emoji} ${n.text}`).join('   •   ')

  return (
    <div
      style={{
        width: '100%',
        height: '38px',
        background: '#C9A84C',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        flexShrink: 0,
      }}
    >
      {/* Fixed "📢 Notice:" label */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0 14px',
          height: '100%',
          background: 'rgba(0,0,0,0.15)',
          borderRight: '1px solid rgba(255,255,255,0.25)',
          whiteSpace: 'nowrap',
          zIndex: 2,
        }}
      >
        <span
          style={{
            fontSize: '12px',
            fontWeight: 800,
            color: '#1A1A2E',
            letterSpacing: '0.06em',
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          📢 Notice:
        </span>
      </div>

      {/* Scrolling marquee */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          className="notice-marquee"
          style={{
            display: 'flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            animation: 'noticeTicker 35s linear infinite',
            gap: '80px',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.animationPlayState = 'paused'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.animationPlayState = 'running'
          }}
        >
          <span
            style={{
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '0.01em',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {noticeText}
          </span>
          <span
            style={{
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '0.01em',
              fontFamily: 'Inter, sans-serif',
            }}
            aria-hidden="true"
          >
            {noticeText}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes noticeTicker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .notice-marquee {
          will-change: transform;
        }
        @media (max-width: 480px) {
          .notice-marquee {
            animation-duration: 28s !important;
          }
        }
      `}</style>
    </div>
  )
}

