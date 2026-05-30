import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

// Print-optimized Temporary Registration Slip
// Opens in new tab — user can Ctrl+P / ⌘+P to save as PDF

interface SlipPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: SlipPageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Temporary Registration Slip — ${id} | MLV PG Services`,
    robots: { index: false, follow: false },
  }
}

async function getApplication(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await supabase
    .from('pre_registrations')
    .select('*')
    .eq('application_id', id.toUpperCase())
    .single()
  return data
}

export default async function SlipPage({ params }: SlipPageProps) {
  const { id } = await params
  const app = await getApplication(id)

  if (!app) notFound()

  const submittedDate = new Date(app.created_at).toLocaleString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  const depositPaid = app.deposit_status === 'paid'
  const depositPaidDate = app.deposit_paid_at
    ? new Date(app.deposit_paid_at).toLocaleString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : null

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Temp Slip — {app.application_id}</title>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

          * { box-sizing: border-box; margin: 0; padding: 0; }
          
          body {
            font-family: 'Inter', sans-serif;
            background: #F8F6F1;
            color: #1A1A2E;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 24px 16px;
          }

          .print-btn-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            max-width: 700px;
            margin-bottom: 20px;
            gap: 12px;
          }

          .print-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 22px;
            background: linear-gradient(135deg, #C9A84C, #E8C96B);
            color: #1A1A2E;
            font-weight: 700;
            font-size: 14px;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            box-shadow: 0 4px 16px rgba(201,168,76,0.35);
            transition: all 0.2s;
          }
          .print-btn:hover { box-shadow: 0 6px 24px rgba(201,168,76,0.5); transform: translateY(-1px); }

          .back-link {
            font-size: 13px;
            color: #8A8AA0;
            text-decoration: none;
          }
          .back-link:hover { color: #C9A84C; }

          /* ── SLIP DOCUMENT ─────────────────────────────── */
          .slip {
            width: 100%;
            max-width: 700px;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 48px rgba(0,0,0,0.12);
            position: relative;
          }

          /* Watermark */
          .slip::before {
            content: 'MLV PG';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-25deg);
            font-size: 96px;
            font-weight: 800;
            color: rgba(201,168,76,0.06);
            pointer-events: none;
            z-index: 0;
            white-space: nowrap;
            letter-spacing: 12px;
          }

          .slip-inner { position: relative; z-index: 1; }

          /* Header */
          .slip-header {
            background: linear-gradient(135deg, #1A1A2E 0%, #2A2A4E 100%);
            padding: 28px 32px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
          }

          .slip-org h1 {
            color: #C9A84C;
            font-size: 20px;
            font-weight: 800;
            letter-spacing: -0.3px;
          }
          .slip-org p { color: rgba(255,255,255,0.5); font-size: 11px; margin-top: 3px; }

          .slip-badge {
            text-align: right;
          }
          .slip-badge .label {
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 2px;
            color: rgba(255,255,255,0.4);
            text-transform: uppercase;
          }
          .slip-badge .app-id {
            font-family: monospace;
            font-size: 16px;
            font-weight: 800;
            color: #C9A84C;
            margin-top: 4px;
            display: block;
          }
          .slip-badge .doc-type {
            display: inline-block;
            margin-top: 6px;
            padding: 3px 10px;
            background: rgba(201,168,76,0.2);
            border: 1px solid rgba(201,168,76,0.4);
            border-radius: 50px;
            font-size: 9px;
            font-weight: 700;
            color: #C9A84C;
            letter-spacing: 1px;
            text-transform: uppercase;
          }

          /* Body */
          .slip-body { padding: 28px 32px; }

          .section { margin-bottom: 24px; }
          .section-title {
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #8A8AA0;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #F0EDE6;
          }

          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .info-item {}
          .info-label {
            font-size: 10px;
            color: #8A8AA0;
            font-weight: 500;
            display: block;
            margin-bottom: 2px;
          }
          .info-value {
            font-size: 13px;
            font-weight: 600;
            color: #1A1A2E;
          }
          .info-full { grid-column: 1 / -1; }

          /* Deposit status */
          .deposit-box {
            border-radius: 12px;
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }
          .deposit-paid { background: #F0FDF4; border: 1px solid #86EFAC; }
          .deposit-pending { background: #FFFBEB; border: 1px solid #FCD34D; }

          .deposit-label { font-size: 11px; font-weight: 600; margin-bottom: 2px; }
          .deposit-paid .deposit-label { color: #166534; }
          .deposit-pending .deposit-label { color: #92400E; }

          .deposit-amount { font-size: 22px; font-weight: 800; }
          .deposit-paid .deposit-amount { color: #16A34A; }
          .deposit-pending .deposit-amount { color: #D97706; }

          .deposit-badge {
            padding: 6px 14px;
            border-radius: 50px;
            font-size: 11px;
            font-weight: 800;
            white-space: nowrap;
          }
          .deposit-paid .deposit-badge { background: #DCFCE7; color: #166534; }
          .deposit-pending .deposit-badge { background: #FEF9C3; color: #92400E; }

          /* Note box */
          .note-box {
            background: #FFFBEB;
            border: 1px solid #FCD34D;
            border-radius: 10px;
            padding: 12px 14px;
            font-size: 11px;
            color: #92400E;
            line-height: 1.6;
          }

          /* Footer */
          .slip-footer {
            border-top: 1px solid #F0EDE6;
            padding: 14px 32px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #FDFBF7;
          }
          .footer-text { font-size: 10px; color: #8A8AA0; }
          .footer-text strong { color: #1A1A2E; }

          /* ── PRINT STYLES ─────────────────────────────── */
          @media print {
            body {
              background: white !important;
              padding: 0 !important;
              display: block !important;
            }
            .print-btn-bar { display: none !important; }
            .slip {
              box-shadow: none !important;
              border-radius: 0 !important;
              max-width: 100% !important;
            }
            @page {
              size: A4;
              margin: 1cm;
            }
          }

          @media (max-width: 600px) {
            .slip-header { flex-direction: column; }
            .slip-badge { text-align: left; }
            .info-grid { grid-template-columns: 1fr; }
            .info-full { grid-column: auto; }
          }
        `}</style>
      </head>
      <body>
        {/* Action bar — hidden on print */}
        <div className="print-btn-bar">
          <a href={`/track-application?id=${app.application_id}`} className="back-link">
            ← Track Application
          </a>
          <button className="print-btn" onClick={() => window.print()}>
            🖨️ Print / Save as PDF
          </button>
        </div>

        {/* The Slip */}
        <div className="slip">
          <div className="slip-inner">

            {/* Header */}
            <div className="slip-header">
              <div className="slip-org">
                <h1>MLV PG Services</h1>
                <p>Premium Student PG · Opp. Acharya Institute, Soladevanahalli, Bangalore</p>
                <p style={{ marginTop: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                  📞 +91 80963 0649
                </p>
              </div>
              <div className="slip-badge">
                <p className="label">Application ID</p>
                <span className="app-id">{app.application_id}</span>
                <span className="doc-type">Temporary Registration Slip</span>
              </div>
            </div>

            {/* Body */}
            <div className="slip-body">

              {/* Applicant Details */}
              <div className="section">
                <p className="section-title">Applicant Details</p>
                <div className="info-grid">
                  <div className="info-item info-full">
                    <span className="info-label">Full Name</span>
                    <span className="info-value" style={{ fontSize: '16px' }}>{app.full_name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Mobile Number</span>
                    <span className="info-value">{app.phone}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email Address</span>
                    <span className="info-value" style={{ fontSize: '12px' }}>{app.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Gender</span>
                    <span className="info-value">{app.gender || '—'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">College / University</span>
                    <span className="info-value">{app.college_name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Course</span>
                    <span className="info-value">{app.course}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Room Preference</span>
                    <span className="info-value">{app.room_preference}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Expected Join Date</span>
                    <span className="info-value">
                      {app.check_in_date
                        ? new Date(app.check_in_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
                        : '—'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Food Preference</span>
                    <span className="info-value">{app.food_preference || '—'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Submitted On</span>
                    <span className="info-value" style={{ fontSize: '12px' }}>{submittedDate}</span>
                  </div>
                </div>
              </div>

              {/* Security Deposit */}
              <div className="section">
                <p className="section-title">Security Deposit Status</p>
                <div className={`deposit-box ${depositPaid ? 'deposit-paid' : 'deposit-pending'}`}>
                  <div>
                    <p className="deposit-label">Security Deposit</p>
                    <p className="deposit-amount">₹5,000</p>
                    {depositPaid && depositPaidDate && (
                      <p style={{ fontSize: '11px', color: '#166534', marginTop: '3px' }}>
                        Paid on {depositPaidDate}
                      </p>
                    )}
                    {depositPaid && app.deposit_payment_id && (
                      <p style={{ fontSize: '10px', color: '#4ADE80', marginTop: '2px', fontFamily: 'monospace' }}>
                        {app.deposit_payment_id}
                      </p>
                    )}
                  </div>
                  <div className="deposit-badge">
                    {depositPaid ? '✓ PAID' : '⏳ PENDING'}
                  </div>
                </div>
              </div>

              {/* Important Note */}
              <div className="note-box">
                <strong>📋 Important Note:</strong> This is a temporary registration slip. Your admission is subject to
                document verification and room availability. Final confirmation will be provided by MLV PG management
                after review. Seat reservation is only confirmed upon security deposit payment.
                Keep this slip for your reference.
              </div>
            </div>

            {/* Footer */}
            <div className="slip-footer">
              <div>
                <p className="footer-text">
                  <strong>MLV PG Services Pvt Ltd</strong> · Opp. Acharya Institute, Soladevanahalli, Bangalore
                </p>
                <p className="footer-text" style={{ marginTop: '2px' }}>
                  This is a system-generated document. No physical signature required.
                </p>
              </div>
              <p className="footer-text" style={{ textAlign: 'right' }}>
                {app.application_id}
              </p>
            </div>

          </div>
        </div>

        {/* Print button script */}
        <script dangerouslySetInnerHTML={{ __html: `
          document.querySelector('.print-btn').addEventListener('click', function() {
            window.print();
          });
        ` }} />
      </body>
    </html>
  )
}
