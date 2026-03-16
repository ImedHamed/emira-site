const express = require('express')
const cors = require('cors')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const db = require('./db')

const app = express()
const PORT = process.env.PORT || 5000

// ── Config ──
const TOKEN_SECRET = crypto.randomBytes(32).toString('hex')
const activeTokens = new Set()

// ── Middleware ──
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:4173',
        'https://www.emira-service.com',
        'https://emira-service.com',
        'https://emira-site.vercel.app'
    ],
    credentials: true
}))
app.use(express.json({ limit: '10mb' }))

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
    const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get('admin')
    if (admin && bcrypt.compareSync(password, admin.password_hash)) {
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
    try {
        const rows = db.prepare('SELECT * FROM services ORDER BY id').all()
        const services = rows.map(s => {
            const features = db.prepare(
                'SELECT text_fr, text_en FROM service_features WHERE service_id = ? ORDER BY sort_order'
            ).all(s.id)
            return {
                id: s.id,
                iconName: s.icon_name,
                title: { fr: s.title_fr, en: s.title_en },
                desc: { fr: s.desc_fr, en: s.desc_en },
                features: {
                    fr: features.map(f => f.text_fr),
                    en: features.map(f => f.text_en)
                }
            }
        })
        res.json({ services })
    } catch (error) {
        console.error('❌ Error reading services:', error)
        res.status(500).json({ success: false, error: 'Erreur lecture données' })
    }
})

app.put('/api/services', requireAuth, (req, res) => {
    try {
        const { services } = req.body
        const updateAll = db.transaction(() => {
            db.prepare('DELETE FROM service_features').run()
            db.prepare('DELETE FROM services').run()

            const insertService = db.prepare(
                'INSERT INTO services (id, icon_name, title_fr, title_en, desc_fr, desc_en) VALUES (?, ?, ?, ?, ?, ?)'
            )
            const insertFeature = db.prepare(
                'INSERT INTO service_features (service_id, text_fr, text_en, sort_order) VALUES (?, ?, ?, ?)'
            )

            for (const s of services) {
                insertService.run(s.id, s.iconName, s.title.fr, s.title.en, s.desc.fr, s.desc.en)
                if (s.features) {
                    const frFeatures = s.features.fr || []
                    const enFeatures = s.features.en || []
                    for (let i = 0; i < frFeatures.length; i++) {
                        insertFeature.run(s.id, frFeatures[i], enFeatures[i] || frFeatures[i], i)
                    }
                }
            }
        })
        updateAll()
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
    try {
        const publicRows = db.prepare('SELECT * FROM public_clients ORDER BY id').all()
        const privateRows = db.prepare('SELECT * FROM private_clients ORDER BY id').all()
        const regionRows = db.prepare('SELECT name FROM regions ORDER BY id').all()

        const mapClient = c => ({
            id: c.id,
            name: { fr: c.name_fr, en: c.name_en },
            desc: { fr: c.desc_fr, en: c.desc_en },
            iconName: c.icon_name
        })

        res.json({
            publicClients: publicRows.map(mapClient),
            privateClients: privateRows.map(mapClient),
            regions: regionRows.map(r => r.name)
        })
    } catch (error) {
        console.error('❌ Error reading clients:', error)
        res.status(500).json({ success: false, error: 'Erreur lecture données' })
    }
})

app.put('/api/clients', requireAuth, (req, res) => {
    try {
        const { publicClients, privateClients, regions } = req.body
        const updateAll = db.transaction(() => {
            // ── Public clients ──
            db.prepare('DELETE FROM public_clients').run()
            const insertPub = db.prepare(
                'INSERT INTO public_clients (id, icon_name, name_fr, name_en, desc_fr, desc_en) VALUES (?, ?, ?, ?, ?, ?)'
            )
            for (const c of publicClients) {
                insertPub.run(c.id, c.iconName, c.name.fr, c.name.en, c.desc.fr, c.desc.en)
            }

            // ── Private clients ──
            db.prepare('DELETE FROM private_clients').run()
            const insertPriv = db.prepare(
                'INSERT INTO private_clients (id, icon_name, name_fr, name_en, desc_fr, desc_en) VALUES (?, ?, ?, ?, ?, ?)'
            )
            for (const c of privateClients) {
                insertPriv.run(c.id, c.iconName, c.name.fr, c.name.en, c.desc.fr, c.desc.en)
            }

            // ── Regions ──
            db.prepare('DELETE FROM regions').run()
            const insertRegion = db.prepare('INSERT INTO regions (name) VALUES (?)')
            for (const r of regions) {
                insertRegion.run(r)
            }
        })
        updateAll()
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
    try {
        const rows = db.prepare('SELECT * FROM team ORDER BY id').all()
        const team = rows.map(t => ({
            id: t.id,
            name: t.name,
            role: { fr: t.role_fr, en: t.role_en },
            phone: t.phone,
            iconName: t.icon_name
        }))
        res.json({ team })
    } catch (error) {
        console.error('❌ Error reading team:', error)
        res.status(500).json({ success: false, error: 'Erreur lecture données' })
    }
})

app.put('/api/team', requireAuth, (req, res) => {
    try {
        const { team } = req.body
        const updateAll = db.transaction(() => {
            db.prepare('DELETE FROM team').run()
            const insertTeam = db.prepare(
                'INSERT INTO team (id, name, role_fr, role_en, phone, icon_name) VALUES (?, ?, ?, ?, ?, ?)'
            )
            for (const t of team) {
                insertTeam.run(t.id, t.name, t.role.fr, t.role.en, t.phone, t.iconName)
            }
        })
        updateAll()
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
