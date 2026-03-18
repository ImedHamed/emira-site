const express = require('express')
const cors = require('cors')
const { Resend } = require('resend')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const { sql, initDB } = require('./db')

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

app.post('/api/admin/login', async (req, res) => {
    try {
        const { password } = req.body
        const rows = await sql`SELECT * FROM admins WHERE username = ${'admin'}`
        const admin = rows[0]
        if (admin && bcrypt.compareSync(password, admin.password_hash)) {
            const token = crypto.randomBytes(48).toString('hex')
            activeTokens.add(token)
            console.log('🔐 Admin logged in')
            res.json({ success: true, token })
        } else {
            res.status(401).json({ success: false, error: 'Mot de passe incorrect' })
        }
    } catch (error) {
        console.error('❌ Login error:', error)
        res.status(500).json({ success: false, error: 'Erreur serveur' })
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

app.get('/api/services', async (req, res) => {
    try {
        const rows = await sql`SELECT * FROM services ORDER BY id`
        const services = []
        for (const s of rows) {
            const features = await sql`SELECT text_fr, text_en FROM service_features WHERE service_id = ${s.id} ORDER BY sort_order`
            services.push({
                id: s.id,
                iconName: s.icon_name,
                title: { fr: s.title_fr, en: s.title_en },
                desc: { fr: s.desc_fr, en: s.desc_en },
                features: {
                    fr: features.map(f => f.text_fr),
                    en: features.map(f => f.text_en)
                }
            })
        }
        res.json({ services })
    } catch (error) {
        console.error('❌ Error reading services:', error)
        res.status(500).json({ success: false, error: 'Erreur lecture données' })
    }
})

app.put('/api/services', requireAuth, async (req, res) => {
    try {
        const { services } = req.body
        await sql`DELETE FROM service_features`
        await sql`DELETE FROM services`

        for (const s of services) {
            await sql`INSERT INTO services (id, icon_name, title_fr, title_en, desc_fr, desc_en)
                VALUES (${s.id}, ${s.iconName}, ${s.title.fr}, ${s.title.en}, ${s.desc.fr}, ${s.desc.en})`
            if (s.features) {
                const frFeatures = s.features.fr || []
                const enFeatures = s.features.en || []
                for (let i = 0; i < frFeatures.length; i++) {
                    await sql`INSERT INTO service_features (service_id, text_fr, text_en, sort_order)
                        VALUES (${s.id}, ${frFeatures[i]}, ${enFeatures[i] || frFeatures[i]}, ${i})`
                }
            }
        }
        if (services.length > 0) {
            await sql`SELECT setval('services_id_seq', (SELECT COALESCE(MAX(id), 1) FROM services))`
        }
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

app.get('/api/clients', async (req, res) => {
    try {
        const pubRows = await sql`SELECT * FROM public_clients ORDER BY id`
        const privRows = await sql`SELECT * FROM private_clients ORDER BY id`
        const regRows = await sql`SELECT name FROM regions ORDER BY id`

        const mapClient = c => ({
            id: c.id,
            name: { fr: c.name_fr, en: c.name_en },
            desc: { fr: c.desc_fr, en: c.desc_en },
            iconName: c.icon_name
        })

        res.json({
            publicClients: pubRows.map(mapClient),
            privateClients: privRows.map(mapClient),
            regions: regRows.map(r => r.name)
        })
    } catch (error) {
        console.error('❌ Error reading clients:', error)
        res.status(500).json({ success: false, error: 'Erreur lecture données' })
    }
})

app.put('/api/clients', requireAuth, async (req, res) => {
    try {
        const { publicClients, privateClients, regions } = req.body

        // ── Public clients ──
        await sql`DELETE FROM public_clients`
        for (const c of publicClients) {
            await sql`INSERT INTO public_clients (id, icon_name, name_fr, name_en, desc_fr, desc_en)
                VALUES (${c.id}, ${c.iconName}, ${c.name.fr}, ${c.name.en}, ${c.desc.fr}, ${c.desc.en})`
        }
        if (publicClients.length > 0) {
            await sql`SELECT setval('public_clients_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public_clients))`
        }

        // ── Private clients ──
        await sql`DELETE FROM private_clients`
        for (const c of privateClients) {
            await sql`INSERT INTO private_clients (id, icon_name, name_fr, name_en, desc_fr, desc_en)
                VALUES (${c.id}, ${c.iconName}, ${c.name.fr}, ${c.name.en}, ${c.desc.fr}, ${c.desc.en})`
        }
        if (privateClients.length > 0) {
            await sql`SELECT setval('private_clients_id_seq', (SELECT COALESCE(MAX(id), 1) FROM private_clients))`
        }

        // ── Regions ──
        await sql`DELETE FROM regions`
        for (const r of regions) {
            await sql`INSERT INTO regions (name) VALUES (${r})`
        }

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

app.get('/api/team', async (req, res) => {
    try {
        const rows = await sql`SELECT * FROM team ORDER BY id`
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

app.put('/api/team', requireAuth, async (req, res) => {
    try {
        const { team } = req.body
        await sql`DELETE FROM team`
        for (const t of team) {
            await sql`INSERT INTO team (id, name, role_fr, role_en, phone, icon_name)
                VALUES (${t.id}, ${t.name}, ${t.role.fr}, ${t.role.en}, ${t.phone}, ${t.iconName})`
        }
        if (team.length > 0) {
            await sql`SELECT setval('team_id_seq', (SELECT COALESCE(MAX(id), 1) FROM team))`
        }
        console.log('✅ Team updated')
        res.json({ success: true, message: 'Équipe mise à jour' })
    } catch (error) {
        console.error('❌ Error saving team:', error)
        res.status(500).json({ success: false, error: 'Erreur sauvegarde' })
    }
})

// ══════════════════════════════════════
// ── Resend Email Configuration ──
// ══════════════════════════════════════

const resend = new Resend(process.env.RESEND_API_KEY || 're_Dt5ScBaR_Lv3p8EdxEB6cca1jvWJKJqUP')

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

    try {
        await resend.emails.send({
            from: 'EMIRA Contact <onboarding@resend.dev>',
            to: 'emira.devis@gmail.com',
            replyTo: email,
            subject: `EMIRA — ${subject}`,
            html: buildEmailHTML({ name, email, phone, subject, message, services, date }),
        })
        console.log(`✅ Email sent: ${subject} from ${name} (${email})`)
        res.json({ success: true, message: 'Email envoyé avec succès' })
    } catch (error) {
        console.error('❌ Email error:', error)
        res.status(500).json({ success: false, error: "Erreur lors de l'envoi" })
    }
})

// ── Start Server (after DB init) ──
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`\n⚡ EMIRA Backend running on http://localhost:${PORT}`)
        console.log(`🗄️  Database: Neon PostgreSQL (serverless/HTTPS)`)
        console.log(`📧 Email service: Resend`)
        console.log(`🔧 Services API: GET/PUT /api/services`)
        console.log(`👥 Clients API: GET/PUT /api/clients`)
        console.log(`👤 Team API: GET/PUT /api/team`)
        console.log(`🔐 Admin Login: POST /api/admin/login\n`)
    })
})
