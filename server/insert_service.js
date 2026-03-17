const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, 'emira.db'))
db.pragma('foreign_keys = ON')

const existing = db.prepare('SELECT id FROM services WHERE id = 13').get()

if (existing) {
    console.log('Service 13 already exists')
} else {
    db.prepare(
        'INSERT INTO services (id, icon_name, title_fr, title_en, desc_fr, desc_en) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
        13,
        'FaChartLine',
        'Étude du Réseau Électrique',
        'Electrical Network Study',
        "Étude du réseau électrique à l'aide d'un analyseur de réseau électrique de marque Chauvin Arnoux CA8336. Analyse complète de la qualité du réseau et recommandations d'amélioration.",
        'Electrical network study using a Chauvin Arnoux CA8336 power network analyzer. Complete network quality analysis and improvement recommendations.'
    )

    const ins = db.prepare(
        'INSERT INTO service_features (service_id, text_fr, text_en, sort_order) VALUES (?, ?, ?, ?)'
    )
    ins.run(13, 'Analyseur Chauvin Arnoux CA8336', 'Chauvin Arnoux CA8336 analyzer', 0)
    ins.run(13, 'Analyse qualité réseau', 'Network quality analysis', 1)
    ins.run(13, 'Mesure des harmoniques', 'Harmonics measurement', 2)
    ins.run(13, "Rapport d'étude détaillé", 'Detailed study report', 3)

    console.log('Service 13 inserted successfully!')
}

db.close()
