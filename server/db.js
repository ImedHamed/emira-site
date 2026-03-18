const { neon } = require('@neondatabase/serverless')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_uiCLSwR05WJZ@ep-winter-recipe-agaxsa6j-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require'

const sql = neon(DATABASE_URL)

const DATA_DIR = path.join(__dirname, 'data')

// ══════════════════════════════════════
// ── Create tables ──
// ══════════════════════════════════════

async function createTables() {
    await sql`
        CREATE TABLE IF NOT EXISTS services (
            id SERIAL PRIMARY KEY,
            icon_name TEXT NOT NULL,
            title_fr TEXT NOT NULL,
            title_en TEXT NOT NULL,
            desc_fr TEXT NOT NULL,
            desc_en TEXT NOT NULL
        )`
    await sql`
        CREATE TABLE IF NOT EXISTS service_features (
            id SERIAL PRIMARY KEY,
            service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
            text_fr TEXT NOT NULL,
            text_en TEXT NOT NULL,
            sort_order INTEGER NOT NULL DEFAULT 0
        )`
    await sql`
        CREATE TABLE IF NOT EXISTS public_clients (
            id SERIAL PRIMARY KEY,
            icon_name TEXT NOT NULL,
            name_fr TEXT NOT NULL,
            name_en TEXT NOT NULL,
            desc_fr TEXT NOT NULL,
            desc_en TEXT NOT NULL
        )`
    await sql`
        CREATE TABLE IF NOT EXISTS private_clients (
            id SERIAL PRIMARY KEY,
            icon_name TEXT NOT NULL,
            name_fr TEXT NOT NULL,
            name_en TEXT NOT NULL,
            desc_fr TEXT NOT NULL,
            desc_en TEXT NOT NULL
        )`
    await sql`
        CREATE TABLE IF NOT EXISTS regions (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL UNIQUE
        )`
    await sql`
        CREATE TABLE IF NOT EXISTS team (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            role_fr TEXT NOT NULL,
            role_en TEXT NOT NULL,
            phone TEXT NOT NULL,
            icon_name TEXT NOT NULL
        )`
    await sql`
        CREATE TABLE IF NOT EXISTS admins (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL
        )`
    console.log('✅ PostgreSQL tables ready')
}

// ══════════════════════════════════════
// ── Seed data from JSON files ──
// ══════════════════════════════════════

async function seedIfEmpty() {
    const countResult = await sql`SELECT COUNT(*) as c FROM services`
    if (parseInt(countResult[0].c) > 0) {
        console.log('📦 Database already seeded — skipping')
        return
    }

    console.log('🌱 Seeding database from JSON files...')

    // ── Services ──
    const servicesData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'services.json'), 'utf-8'))
    for (const s of servicesData.services) {
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
    await sql`SELECT setval('services_id_seq', (SELECT MAX(id) FROM services))`
    console.log(`   ✅ ${servicesData.services.length} services inserted`)

    // ── Clients ──
    const clientsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'clients.json'), 'utf-8'))
    for (const c of clientsData.publicClients) {
        await sql`INSERT INTO public_clients (id, icon_name, name_fr, name_en, desc_fr, desc_en)
            VALUES (${c.id}, ${c.iconName}, ${c.name.fr}, ${c.name.en}, ${c.desc.fr}, ${c.desc.en})`
    }
    await sql`SELECT setval('public_clients_id_seq', (SELECT MAX(id) FROM public_clients))`
    console.log(`   ✅ ${clientsData.publicClients.length} public clients inserted`)

    for (const c of clientsData.privateClients) {
        await sql`INSERT INTO private_clients (id, icon_name, name_fr, name_en, desc_fr, desc_en)
            VALUES (${c.id}, ${c.iconName}, ${c.name.fr}, ${c.name.en}, ${c.desc.fr}, ${c.desc.en})`
    }
    await sql`SELECT setval('private_clients_id_seq', (SELECT MAX(id) FROM private_clients))`
    console.log(`   ✅ ${clientsData.privateClients.length} private clients inserted`)

    for (const r of clientsData.regions) {
        await sql`INSERT INTO regions (name) VALUES (${r}) ON CONFLICT DO NOTHING`
    }
    console.log(`   ✅ ${clientsData.regions.length} regions inserted`)

    // ── Team ──
    const teamData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'team.json'), 'utf-8'))
    for (const t of teamData.team) {
        await sql`INSERT INTO team (id, name, role_fr, role_en, phone, icon_name)
            VALUES (${t.id}, ${t.name}, ${t.role.fr}, ${t.role.en}, ${t.phone}, ${t.iconName})`
    }
    await sql`SELECT setval('team_id_seq', (SELECT MAX(id) FROM team))`
    console.log(`   ✅ ${teamData.team.length} team members inserted`)

    console.log('🎉 Database seeding complete!\n')
}

// ── Ensure admin account exists ──
async function ensureAdmin() {
    const countResult = await sql`SELECT COUNT(*) as c FROM admins`
    if (parseInt(countResult[0].c) === 0) {
        const hash = bcrypt.hashSync('emira2024admin', 10)
        await sql`INSERT INTO admins (username, password_hash) VALUES (${'admin'}, ${hash})`
        console.log('✅ Default admin account created (username: admin)')
    }
}

// ── Initialize ──
async function initDB() {
    try {
        await createTables()
        await seedIfEmpty()
        await ensureAdmin()
        console.log('✅ PostgreSQL database initialized')
    } catch (error) {
        console.error('❌ Database initialization error:', error)
        process.exit(1)
    }
}

module.exports = { sql, initDB }
