const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, 'emira.db'))

db.prepare('DELETE FROM team').run()

const ins = db.prepare('INSERT INTO team (id, name, role_fr, role_en, phone, icon_name) VALUES (?, ?, ?, ?, ?, ?)')
ins.run(1, 'Maher ZOUARI', 'Gérant', 'Manager', '20 832 832 / 50 832 259', 'FaUsers')
ins.run(2, 'Imen Maaoui', 'Ingénieur INSAT', 'INSAT Engineer', '52 515 171', 'FaAward')
ins.run(3, 'Isam Eddine MAATOUGUI', 'Technicien Supérieur', 'Senior Technician', '53 832 099', 'FaUsers')
ins.run(4, 'Hosni BOUZID', 'Technicien', 'Technician', '54 554 062', 'FaUsers')
ins.run(5, 'Moncef SAIDANI', 'Technicien', 'Technician', '52 150 516', 'FaUsers')

console.log('Team updated! Habib removed, 3 new members kept.')
db.close()
