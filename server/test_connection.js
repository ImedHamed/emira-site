const { neon } = require('@neondatabase/serverless')

const sql = neon('postgresql://neondb_owner:npg_uiCLSwR05WJZ@ep-winter-recipe-agaxsa6j-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require')

console.log('Testing Neon serverless driver...')

sql`SELECT NOW() as time`
    .then(r => {
        console.log('CONNECTED OK:', r[0].time)
        process.exit(0)
    })
    .catch(e => {
        console.log('FAILED:', e.message)
        process.exit(1)
    })
