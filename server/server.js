import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'

const app = express()
const PORT = 5000

// ── Middleware ──
app.use(cors())
app.use(express.json())

// ── Gmail SMTP Configuration ──
// You need a Gmail App Password (not your normal password)
// Go to: https://myaccount.google.com/apppasswords
// Generate one for "Mail" → "Windows Computer"
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'med.hm17@gmail.com',        // your Gmail
        pass: 'hscrgpngpeylcsqr',        // Gmail App Password (16 chars)
    },
})

// ── Professional HTML Email Template ──
function buildEmailHTML({ name, email, phone, subject, message, services, date }) {
    return `
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:#f0f2f5; font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:600px; margin:20px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1a2744,#0f1a2e); padding:32px; text-align:center;">
        <h1 style="color:#ffffff; margin:0; font-size:28px; letter-spacing:1px;">⚡ EMIRA</h1>
        <p style="color:#dc2626; margin:6px 0 0; font-size:12px; letter-spacing:3px; text-transform:uppercase;">Electro Maintenance Intervention Rapide</p>
    </div>

    <!-- Subject Banner -->
    <div style="padding:24px 32px; background:linear-gradient(135deg,#f8f9fa,#eef1f5); border-bottom:3px solid #dc2626;">
        <h2 style="color:#1a2744; margin:0 0 4px; font-size:20px;">📩 ${subject}</h2>
        <p style="color:#6b7280; font-size:13px; margin:0;">Reçue le ${date}</p>
    </div>

    <!-- Contact Info Table -->
    <div style="padding:32px;">
        <table style="width:100%; border-collapse:collapse;">
            <tr>
                <td style="padding:14px 16px; border-bottom:1px solid #e5e7eb; color:#9ca3af; font-size:13px; text-transform:uppercase; letter-spacing:1px; width:110px;">Nom</td>
                <td style="padding:14px 16px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#1a2744; font-size:15px;">${name}</td>
            </tr>
            <tr>
                <td style="padding:14px 16px; border-bottom:1px solid #e5e7eb; color:#9ca3af; font-size:13px; text-transform:uppercase; letter-spacing:1px;">Email</td>
                <td style="padding:14px 16px; border-bottom:1px solid #e5e7eb;">
                    <a href="mailto:${email}" style="color:#dc2626; text-decoration:none; font-weight:600;">${email}</a>
                </td>
            </tr>
            <tr>
                <td style="padding:14px 16px; border-bottom:1px solid #e5e7eb; color:#9ca3af; font-size:13px; text-transform:uppercase; letter-spacing:1px;">Téléphone</td>
                <td style="padding:14px 16px; border-bottom:1px solid #e5e7eb; color:#1a2744; font-weight:600;">
                    <a href="tel:${phone}" style="color:#1a2744; text-decoration:none;">${phone}</a>
                </td>
            </tr>
            ${services && services !== 'Aucun service spécifique' ? `
            <tr>
                <td style="padding:14px 16px; border-bottom:1px solid #e5e7eb; color:#9ca3af; font-size:13px; text-transform:uppercase; letter-spacing:1px;">Services</td>
                <td style="padding:14px 16px; border-bottom:1px solid #e5e7eb; color:#1a2744;">${services}</td>
            </tr>
            ` : ''}
        </table>

        <!-- Message Box -->
        <div style="margin-top:28px; padding:24px; background:#f8f9fa; border-radius:10px; border-left:4px solid #dc2626;">
            <p style="color:#9ca3af; margin:0 0 10px; font-size:11px; text-transform:uppercase; letter-spacing:1.5px;">Message du client</p>
            <p style="color:#1a2744; margin:0; line-height:1.8; font-size:15px; white-space:pre-line;">${message}</p>
        </div>

        <!-- Reply CTA -->
        <div style="margin-top:28px; text-align:center;">
            <a href="mailto:${email}?subject=RE: ${subject} - EMIRA" 
               style="display:inline-block; padding:14px 36px; background:linear-gradient(135deg,#dc2626,#b91c1c); color:#ffffff; text-decoration:none; border-radius:8px; font-weight:700; font-size:14px; letter-spacing:0.5px;">
                Répondre à ${name}
            </a>
        </div>
    </div>

    <!-- Footer -->
    <div style="background:#1a2744; padding:24px; text-align:center;">
        <p style="color:rgba(255,255,255,0.5); margin:0; font-size:11px; letter-spacing:0.5px;">
            EMIRA SARL — Route de Sousse Km6, Mégrine 2033, Tunisie
        </p>
        <p style="color:rgba(255,255,255,0.3); margin:6px 0 0; font-size:10px;">
            Email envoyé depuis le formulaire de contact du site web EMIRA
        </p>
    </div>
</div>
</body>
</html>`
}

// ── API Endpoint ──
app.post('/api/contact', async (req, res) => {
    const { name, email, phone, subject, message, services } = req.body

    // Validation
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ success: false, error: 'Champs requis manquants' })
    }

    const date = new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })

    const mailOptions = {
        from: `"${name} via EMIRA" <med.hm17@gmail.com>`,
        replyTo: email,
        to: 'imedbenamor.hm@gmail.com',
        subject: `EMIRA — ${subject}`,
        html: buildEmailHTML({ name, email, phone, subject, message, services, date }),
    }

    try {
        await transporter.sendMail(mailOptions)
        console.log(`✅ Email sent: ${subject} from ${name} (${email})`)
        res.json({ success: true, message: 'Email envoyé avec succès' })
    } catch (error) {
        console.error('❌ Email error:', error)
        res.status(500).json({ success: false, error: 'Erreur lors de l\'envoi' })
    }
})

// ── Start Server ──
app.listen(PORT, () => {
    console.log(`\n⚡ EMIRA Backend running on http://localhost:${PORT}`)
    console.log(`📧 Contact API: POST http://localhost:${PORT}/api/contact\n`)
})
