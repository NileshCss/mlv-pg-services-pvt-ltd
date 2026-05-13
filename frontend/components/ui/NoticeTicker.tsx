'use client'

import React from 'react'

const notices = [
  '🏠 New rooms now available – Limited seats!',
  '🍽️ Updated Food Menu for this month is live',
  '📋 Pre-Registration open for 2026 batch',
  '📞 Contact us: +91 8809630649',
  '✅ WiFi upgraded to 1 Gbps across all floors',
]

const noticeText = notices.join('   •   ')

export const NoticeTicker: React.FC = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '38px',
        background: 'linear-gradient(90deg, #0a0f1e 0%, #111827 100%)',
        borderBottom: '1px solid rgba(201,168,76,0.25)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 49, // just below navbar (z-50)
        flexShrink: 0,
      }}
    >
      {/* Fixed label */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0 14px',
          height: '100%',
          background: 'linear-gradient(135deg, #c9a84c 0%, #e8c96d 100%)',
          borderRight: '1px solid rgba(201,168,76,0.4)',
          whiteSpace: 'nowrap',
          zIndex: 2,
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0a0f1e', letterSpacing: '0.02em' }}>
          📢 Notice:
        </span>
      </div>

      {/* Scrolling area */}
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
            ;(e.currentTarget as HTMLElement).style.animationPlayState = 'paused'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.animationPlayState = 'running'
          }}
        >
          {/* Duplicate for seamless loop */}
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#d1d5db', letterSpacing: '0.01em' }}>
            {noticeText}
          </span>
          <span
            style={{ fontSize: '13px', fontWeight: 500, color: '#d1d5db', letterSpacing: '0.01em' }}
            aria-hidden="true"
          >
            {noticeText}
          </span>
        </div>
      </div>

      {/* CSS keyframes via style tag */}
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
