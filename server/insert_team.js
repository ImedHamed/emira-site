const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, 'emira.db'))

const ins = db.prepare('INSERT OR IGNORE INTO team (id, name, role_fr, role_en, phone, icon_name) VALUES (?, ?, ?, ?, ?, ?)')

ins.run(4, 'Isam Eddine MAATOUGUI', 'Technicien Supérieur', 'Senior Technician', '53 832 099', 'FaUsers')
ins.run(5, 'Hosni BOUZID', 'Technicien', 'Technician', '54 554 062', 'FaUsers')
ins.run(6, 'Moncef SAIDANI', 'Technicien', 'Technician', '52 150 516', 'FaUsers')

console.log('3 team members inserted!')
db.close()
