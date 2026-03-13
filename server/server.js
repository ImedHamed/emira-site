const express = require('express')
const cors = require('cors')
const nodemailer = require('nodemailer')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const app = express()
const PORT = 5000

// ── Config ──
const ADMIN_PASSWORD = 'emira2024admin'
const TOKEN_SECRET = crypto.randomBytes(32).toString('hex')
const activeTokens = new Set()

// ── Data file paths ──
const DATA_DIR = path.join(__dirname, 'data')
const SERVICES_FILE = path.join(DATA_DIR, 'services.json')
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json')
const TEAM_FILE = path.join(DATA_DIR, 'team.json')

// ── Middleware ──
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// ── Helper: read/write JSON ──
function readJSON(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    } catch {
        return null
    }
}

function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

// ── Auth Middleware ──
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'Non autorisé' })
    }
    const token = authHeader.split(' ')[1]
    if (!activeTokens.has(token)) {
        return res.status(401).json({ success: false, error: 'Token invalide' })
    }
    next()
}

// ══════════════════════════════════════
// ── Admin Auth ──
// ══════════════════════════════════════

app.post('/api/admin/login', (req, res) => {
    const { password } = req.body
    if (password === ADMIN_PASSWORD) {
        const token = crypto.randomBytes(48).toString('hex')
        activeTokens.add(token)
        console.log('🔐 Admin logged in')
        res.json({ success: true, token })
    } else {
        res.status(401).json({ success: false, error: 'Mot de passe incorrect' })
    }
})

app.post('/api/admin/logout', requireAuth, (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    activeTokens.delete(token)
    res.json({ success: true })
})

// ══════════════════════════════════════
// ── Services API ──
// ══════════════════════════════════════

app.get('/api/services', (req, res) => {
    const data = readJSON(SERVICES_FILE)
    if (!data) return res.status(500).json({ success: false, error: 'Erreur lecture données' })
    res.json(data)
})

app.put('/api/services', requireAuth, (req, res) => {
    try {
        writeJSON(SERVICES_FILE, req.body)
        console.log('✅ Services updated')
        res.json({ success: true, message: 'Services mis à jour' })
    } catch (error) {
        console.error('❌ Error saving services:', error)
        res.status(500).json({ success: false, error: 'Erreur sauvegarde' })
    }
})

// ══════════════════════════════════════
// ── Clients API ──
// ══════════════════════════════════════

app.get('/api/clients', (req, res) => {
    const data = readJSON(CLIENTS_FILE)
    if (!data) return res.status(500).json({ success: false, error: 'Erreur lecture données' })
    res.json(data)
})

app.put('/api/clients', requireAuth, (req, res) => {
    try {
        writeJSON(CLIENTS_FILE, req.body)
        console.log('✅ Clients updated')
        res.json({ success: true, message: 'Clients mis à jour' })
    } catch (error) {
        console.error('❌ Error saving clients:', error)
        res.status(500).json({ success: false, error: 'Erreur sauvegarde' })
    }
})

// ══════════════════════════════════════
// ── Team API ──
// ══════════════════════════════════════

app.get('/api/team', (req, res) => {
    const data = readJSON(TEAM_FILE)
    if (!data) return res.status(500).json({ success: false, error: 'Erreur lecture données' })
    res.json(data)
})

app.put('/api/team', requireAuth, (req, res) => {
    try {
        writeJSON(TEAM_FILE, req.body)
        console.log('✅ Team updated')
        res.json({ success: true, message: 'Équipe mise à jour' })
    } catch (error) {
        console.error('❌ Error saving team:', error)
        res.status(500).json({ success: false, error: 'Erreur sauvegarde' })
    }
})

// ══════════════════════════════════════
// ── Gmail SMTP Configuration ──
// ══════════════════════════════════════

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'fekheryahya@gmail.com',
        pass: 'wepxfbsbsxrvmsvv',
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

// ── Contact API Endpoint ──
app.post('/api/contact', async (req, res) => {
    const { name, email, phone, subject, message, services } = req.body

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
        from: `"${name} via EMIRA" <fekheryahya@gmail.com>`,
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
    console.log(`📧 Contact API: POST http://localhost:${PORT}/api/contact`)
    console.log(`🔧 Services API: GET/PUT http://localhost:${PORT}/api/services`)
    console.log(`👥 Clients API: GET/PUT http://localhost:${PORT}/api/clients`)
    console.log(`👤 Team API: GET/PUT http://localhost:${PORT}/api/team`)
    console.log(`🔐 Admin Login: POST http://localhost:${PORT}/api/admin/login\n`)
})
