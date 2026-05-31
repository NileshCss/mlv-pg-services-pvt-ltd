import { createClient } from '@supabase/supabase-js'

// Interface for notification payload
export interface NotificationPayload {
  title: string
  message: string
  type: 'registration' | 'complaint' | 'payment' | 'contact' | 'review' | 'student' | 'room' | 'building' | 'system'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  recipient_type?: 'admin' | 'student'
  recipient_id?: string | null
  metadata?: Record<string, any> // Custom metadata for email templates
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

/**
 * Dispatches a notification across multiple channels:
 * 1. Inserts into the Supabase database (Dashboard alert with Realtime)
 * 2. Renders and dispatches a branded HTML email via Resend
 * 3. Sends a WhatsApp notification via Twilio / CallMeBot webhook
 */
export async function dispatchNotification(payload: NotificationPayload) {
  const supabase = getServiceClient()
  const priority = payload.priority || 'medium'
  const recipient_type = payload.recipient_type || 'admin'
  const recipient_id = payload.recipient_id || null

  try {
    // ── 1. Fetch Notification Preferences ────────────────────────
    let emailEnabled = true
    let whatsappEnabled = true
    let dashboardEnabled = true

    if (recipient_type === 'admin') {
      if (recipient_id) {
        // Fetch specific admin settings
        const { data: settings } = await supabase
          .from('admin_notification_settings')
          .select('*')
          .eq('admin_id', recipient_id)
          .maybeSingle()
        if (settings) {
          emailEnabled = settings.email_enabled
          whatsappEnabled = settings.whatsapp_enabled
          dashboardEnabled = settings.dashboard_enabled
        }
      } else {
        // Broadcast to all admins, default to enabled
        emailEnabled = true
        whatsappEnabled = true
        dashboardEnabled = true
      }
    }

    // ── 2. Insert Database Log (Dashboard Alert) ────────────────
    let insertedNotifId: string | null = null

    if (dashboardEnabled) {
      const { data: dbNotif, error: dbError } = await supabase
        .from('notifications')
        .insert({
          title: payload.title,
          message: payload.message,
          type: payload.type,
          priority: priority,
          recipient_type: recipient_type,
          recipient_id: recipient_id,
          read_status: false,
        })
        .select('id')
        .single()

      if (dbError) {
        console.error('[Notification Dispatch] Database insert error:', dbError.message)
      } else {
        insertedNotifId = dbNotif.id
      }
    }

    // ── 3. Dispatch Email Notification (Resend) ─────────────────
    let emailSent = false
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@mlvpg.com'

    if (emailEnabled && process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_api_key') {
      const emailHtml = generateEmailTemplate(payload)
      const recipientEmails = recipient_type === 'admin' 
        ? [adminEmail] 
        : payload.metadata?.email ? [payload.metadata.email] : []

      if (recipientEmails.length > 0) {
        try {
          const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'MLV PG Notifications <noreply@mlvpg.com>',
              to: recipientEmails,
              subject: `🔔 [${priority.toUpperCase()}] ${payload.title} | MLV PG`,
              html: emailHtml,
            }),
          })

          if (emailRes.ok) {
            emailSent = true
          } else {
            const errText = await emailRes.text()
            console.error('[Notification Dispatch] Resend response error:', errText)
          }
        } catch (emailErr: any) {
          console.error('[Notification Dispatch] Resend connection failed:', emailErr.message)
        }
      }
    }

    // ── 4. Dispatch WhatsApp Alert ──────────────────────────────
    let whatsappSent = false
    const waPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918809630649'
    const callmebotApiKey = process.env.CALLMEBOT_API_KEY

    if (whatsappEnabled && recipient_type === 'admin') {
      const waMessage = generateWhatsAppText(payload)

      if (callmebotApiKey) {
        try {
          const waUrl = `https://api.callmebot.com/whatsapp.php?phone=${waPhone}&text=${encodeURIComponent(waMessage)}&apikey=${callmebotApiKey}`
          const waRes = await fetch(waUrl)
          if (waRes.ok) {
            whatsappSent = true
          } else {
            console.error('[Notification Dispatch] CallMeBot API returned non-200 response')
          }
        } catch (waErr: any) {
          console.error('[Notification Dispatch] CallMeBot connection failed:', waErr.message)
        }
      } else {
        // Fallback: log the WA message clearly in development node logs
        console.log(`\n============== [WHATSAPP SIMULATED MESSAGE] TO: ${waPhone} ==============\n${waMessage}\n========================================================================\n`)
        whatsappSent = true // Mark as sent for fallback tracking
      }
    }

    // ── 5. Update Notification Status ───────────────────────────
    if (insertedNotifId) {
      await supabase
        .from('notifications')
        .update({
          email_sent: emailSent,
          whatsapp_sent: whatsappSent,
          updated_at: new Date().toISOString()
        })
        .eq('id', insertedNotifId)
    }

    return { success: true, dbId: insertedNotifId, emailSent, whatsappSent }

  } catch (err: any) {
    console.error('[Notification Dispatch] Critical error:', err.message)
    return { success: false, error: err.message }
  }
}

/** Renders a highly responsive branded HTML email layout matching the MLV gold luxury theme */
function generateEmailTemplate(payload: NotificationPayload): string {
  const meta = payload.metadata || {}
  const goldAccent = '#C8840A'
  
  // Format metadata keys into standard rows
  let metaRowsHtml = ''
  Object.entries(meta).forEach(([key, val]) => {
    if (key === 'email' || key === 'html') return // skip formatting main raw payload properties
    const formattedKey = key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
    metaRowsHtml += `
      <tr style="border-bottom: 1px solid #2a344e;">
        <td style="padding: 10px 0; color: #8A8AA0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">${formattedKey}</td>
        <td style="padding: 10px 0; font-weight: bold; color: #ffffff; font-size: 14px; text-align: right;">${val}</td>
      </tr>
    `
  })

  return `
    <div style="font-family: 'Playfair Display', 'Plus Jakarta Sans', sans-serif; background-color: #0A0E1A; max-width: 580px; margin: 0 auto; color: #e2e8f0; border-radius: 16px; border: 1px solid rgba(200,132,10,0.15); overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <!-- Header banner with logo design -->
      <div style="background: linear-gradient(135deg, #0F1629 0%, #080C18 100%); padding: 32px 40px; border-bottom: 2px solid ${goldAccent}; text-align: center;">
        <h2 style="color: ${goldAccent}; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px; font-serif: Georgia, serif;">MLV PG Services</h2>
        <p style="color: #8A8AA0; font-size: 11px; margin: 6px 0 0; text-transform: uppercase; letter-spacing: 1.5px;">Premium Student Residence, Bangalore</p>
      </div>

      <!-- Main Body -->
      <div style="padding: 32px 40px; background-color: #0F1629;">
        <h3 style="margin-top: 0; color: #ffffff; font-size: 18px; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 12px; display: flex; items-center: center; gap: 8px;">
          🔔 Alert: ${payload.title}
        </h3>
        <p style="color: #9CA3AF; font-size: 14px; line-height: 1.6; margin: 16px 0;">${payload.message}</p>

        <!-- Dynamic Data Fields -->
        ${metaRowsHtml ? `
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <tbody>
            ${metaRowsHtml}
          </tbody>
        </table>
        ` : ''}

        <!-- Priority / Urgency Tag -->
        <div style="margin: 20px 0; background: rgba(200,132,10,0.08); border: 1px solid rgba(200,132,10,0.2); border-radius: 8px; padding: 12px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: ${goldAccent}; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
            Priority: ${payload.priority || 'medium'}
          </p>
        </div>

        <!-- Call to action redirects -->
        <div style="margin-top: 32px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://mlvpg.com'}/admin/dashboard" 
             style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, ${goldAccent}, #E8C96D); color: #000000; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 13px; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(200,132,10,0.25);">
            Open Admin Dashboard →
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #080C18; padding: 20px 40px; text-align: center; border-top: 1px solid rgba(255,255,255,0.04);">
        <p style="margin: 0; font-size: 11px; color: #4b5563;">
          MLV PG Services | Opposite Acharya Institute, Soladevanahalli, Bangalore<br/>
          This is an automated operational notification.
        </p>
      </div>
    </div>
  `
}

/** Renders standard emojis and layout text for WhatsApp Business API / Twilio */
function generateWhatsAppText(payload: NotificationPayload): string {
  const meta = payload.metadata || {}
  const priorityEmoji = payload.priority === 'critical' ? '🚨' : payload.priority === 'high' ? '⚠️' : '🔔'
  const priorityLabel = (payload.priority || 'medium').toUpperCase()

  let text = `${priorityEmoji} *[${priorityLabel}] ${payload.title}*\n\n`
  text += `${payload.message}\n\n`

  const ignoredKeys = ['email', 'html']
  Object.entries(meta).forEach(([key, val]) => {
    if (ignoredKeys.includes(key)) return
    const formattedKey = key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
    text += `• *${formattedKey}*: ${val}\n`
  })

  text += `\n👉 View Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://mlvpg.com'}/admin/dashboard`
  return text
}
