const Database = require('better-sqlite3')
const bcrypt = require('bcryptjs')
const path = require('path')
const fs = require('fs')

const DB_PATH = path.join(__dirname, 'emira.db')
const DATA_DIR = path.join(__dirname, 'data')

// ── Open (or create) the database ──
const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ══════════════════════════════════════
// ── Create tables ──
// ══════════════════════════════════════

db.exec(`
    CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY,
        icon_name TEXT NOT NULL,
        title_fr TEXT NOT NULL,
        title_en TEXT NOT NULL,
        desc_fr TEXT NOT NULL,
        desc_en TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS service_features (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id INTEGER NOT NULL,
        text_fr TEXT NOT NULL,
        text_en TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS public_clients (
        id INTEGER PRIMARY KEY,
        icon_name TEXT NOT NULL,
        name_fr TEXT NOT NULL,
        name_en TEXT NOT NULL,
        desc_fr TEXT NOT NULL,
        desc_en TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS private_clients (
        id INTEGER PRIMARY KEY,
        icon_name TEXT NOT NULL,
        name_fr TEXT NOT NULL,
        name_en TEXT NOT NULL,
        desc_fr TEXT NOT NULL,
        desc_en TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS regions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS team (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        role_fr TEXT NOT NULL,
        role_en TEXT NOT NULL,
        phone TEXT NOT NULL,
        icon_name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL
    );
`)

// ══════════════════════════════════════
// ── Seed data from JSON files ──
// ══════════════════════════════════════

function seedIfEmpty() {
    const count = db.prepare('SELECT COUNT(*) as c FROM services').get().c
    if (count > 0) {
        console.log('📦 Database already seeded — skipping')
        return
    }

    console.log('🌱 Seeding database from JSON files...')

    const seedAll = db.transaction(() => {
        // ── Services ──
        const servicesData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'services.json'), 'utf-8'))
        const insertService = db.prepare(
            'INSERT INTO services (id, icon_name, title_fr, title_en, desc_fr, desc_en) VALUES (?, ?, ?, ?, ?, ?)'
        )
        const insertFeature = db.prepare(
            'INSERT INTO service_features (service_id, text_fr, text_en, sort_order) VALUES (?, ?, ?, ?)'
        )

        for (const s of servicesData.services) {
            insertService.run(s.id, s.iconName, s.title.fr, s.title.en, s.desc.fr, s.desc.en)
            if (s.features) {
                const frFeatures = s.features.fr || []
                const enFeatures = s.features.en || []
                for (let i = 0; i < frFeatures.length; i++) {
                    insertFeature.run(s.id, frFeatures[i], enFeatures[i] || frFeatures[i], i)
                }
            }
        }
        console.log(`   ✅ ${servicesData.services.length} services inserted`)

        // ── Clients ──
        const clientsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'clients.json'), 'utf-8'))
        const insertPublicClient = db.prepare(
            'INSERT INTO public_clients (id, icon_name, name_fr, name_en, desc_fr, desc_en) VALUES (?, ?, ?, ?, ?, ?)'
        )
        const insertPrivateClient = db.prepare(
            'INSERT INTO private_clients (id, icon_name, name_fr, name_en, desc_fr, desc_en) VALUES (?, ?, ?, ?, ?, ?)'
        )
        const insertRegion = db.prepare(
            'INSERT INTO regions (name) VALUES (?)'
        )

        for (const c of clientsData.publicClients) {
            insertPublicClient.run(c.id, c.iconName, c.name.fr, c.name.en, c.desc.fr, c.desc.en)
        }
        console.log(`   ✅ ${clientsData.publicClients.length} public clients inserted`)

        for (const c of clientsData.privateClients) {
            insertPrivateClient.run(c.id, c.iconName, c.name.fr, c.name.en, c.desc.fr, c.desc.en)
        }
        console.log(`   ✅ ${clientsData.privateClients.length} private clients inserted`)

        for (const r of clientsData.regions) {
            insertRegion.run(r)
        }
        console.log(`   ✅ ${clientsData.regions.length} regions inserted`)

        // ── Team ──
        const teamData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'team.json'), 'utf-8'))
        const insertTeam = db.prepare(
            'INSERT INTO team (id, name, role_fr, role_en, phone, icon_name) VALUES (?, ?, ?, ?, ?, ?)'
        )

        for (const t of teamData.team) {
            insertTeam.run(t.id, t.name, t.role.fr, t.role.en, t.phone, t.iconName)
        }
        console.log(`   ✅ ${teamData.team.length} team members inserted`)
    })

    seedAll()
    console.log('🎉 Database seeding complete!\n')
}

// ── Always ensure admin account exists (independent of data seeding) ──
function ensureAdmin() {
    const adminCount = db.prepare('SELECT COUNT(*) as c FROM admins').get().c
    if (adminCount === 0) {
        const hash = bcrypt.hashSync('emira2024admin', 10)
        db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('admin', hash)
        console.log('✅ Default admin account created (username: admin)')
    }
}

seedIfEmpty()
ensureAdmin()

module.exports = db
