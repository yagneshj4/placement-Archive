import nodemailer from 'nodemailer'

let cachedTransporter = null

function getTransporter() {
	if (cachedTransporter) return cachedTransporter

	if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
		console.warn('Email credentials not configured. Digest emails are disabled.')
		return null
	}

	cachedTransporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	})

	return cachedTransporter
}

function escapeHtml(input = '') {
	return String(input)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;')
}

export function buildDigestHTML({ userName, topQuestions, weekNumber, appUrl, unsubscribeUrl }) {
	const difficultyLabel = {
		1: 'Easy',
		2: 'Easy-Med',
		3: 'Medium',
		4: 'Hard',
		5: 'Expert',
	}

	const questionsHTML = topQuestions.length === 0
		? '<p style="color:#6b7280;font-size:14px;">No new activity this week. Check back next week.</p>'
		: topQuestions
			.map((q, index) => {
				const tags = (q.tags || []).slice(0, 3)
				const tagsHTML = tags
					.map(
						(tag) => `<span style="display:inline-block;margin:2px;padding:2px 8px;background:#ede9fe;color:#5b21b6;border-radius:12px;font-size:11px;">${escapeHtml(tag)}</span>`,
					)
					.join('')

				return `
					<div style="margin-bottom:16px;padding:14px;background:#f9fafb;border-radius:8px;border-left:3px solid #7c3aed;">
						<p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#111827;">
							${index + 1}. ${escapeHtml(q.text || '')}
						</p>
						<p style="margin:0 0 8px;font-size:12px;color:#6b7280;">
							${escapeHtml(q.company || 'Various')} | ${escapeHtml((q.roundType || 'technical').replace('_', ' '))} | ${escapeHtml(q.year || '2024')}
						</p>
						${tags.length > 0 ? `<div>${tagsHTML}</div>` : ''}
						${q.difficulty ? `<p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">Difficulty: ${difficultyLabel[q.difficulty] || 'Medium'}</p>` : ''}
					</div>
				`
			})
			.join('')

	return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background:#7c3aed;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
      <h1 style="margin:0;color:white;font-size:22px;font-weight:700;">The Placement Archive</h1>
      <p style="margin:6px 0 0;color:#ddd6fe;font-size:14px;">Your weekly preparation digest | Week ${weekNumber}</p>
    </div>

    <div style="background:white;padding:28px 32px;">
      <p style="margin:0 0 20px;font-size:15px;color:#111827;">Hi <b>${escapeHtml(userName || 'Student')}</b>,</p>
      <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
        Here are the top interview questions from the archive this week, ranked by your preparation relevance.
      </p>

      <h2 style="margin:0 0 16px;font-size:15px;font-weight:600;color:#111827;">This week's top questions</h2>
      ${questionsHTML}

      <div style="text-align:center;margin-top:28px;padding-top:24px;border-top:1px solid #e5e7eb;">
        <a href="${appUrl}/dashboard"
          style="display:inline-block;background:#7c3aed;color:white;text-decoration:none;
                 padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">
          View your gap dashboard
        </a>
      </div>
    </div>

    <div style="background:#f9fafb;border-radius:0 0 12px 12px;padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">
        VR Siddhartha Engineering College | Placement Archive<br>
        <a href="${unsubscribeUrl}" style="color:#9ca3af;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

export async function sendDigestEmail({ to, userId, userName, topQuestions, weekNumber }) {
	const transporter = getTransporter()
	if (!transporter) {
		console.log(`[Email] No transporter - credentials disabled for ${to}`)
		return { sent: false, reason: 'no_credentials' }
	}

	const appUrl = process.env.CLIENT_URL || 'http://localhost:5173'
	const token = Buffer.from(String(userId)).toString('base64url')
	const unsubscribeUrl = `${process.env.API_URL || 'http://localhost:5000/api'}/analytics/unsubscribe/${token}`
	const html = buildDigestHTML({ userName, topQuestions, weekNumber, appUrl, unsubscribeUrl })
	console.log(`[Email] Sending digest to ${to} - ${topQuestions.length} questions`)

	try {
		const info = await transporter.sendMail({
			from: `"${process.env.EMAIL_FROM_NAME || 'The Placement Archive'}" <${process.env.EMAIL_USER}>`,
			to,
			subject: `[Week ${weekNumber}] Your placement prep digest - ${topQuestions.length} questions`,
			html,
		})

		return { sent: true, messageId: info.messageId }
	} catch (err) {
		return { sent: false, error: err.message }
	}
}
