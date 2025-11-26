import { Pool } from "pg";

export default new Pool({
    connectionString: 'postgresql://neondb_owner:npg_FSB7KmGoln6g@ep-rough-waterfall-acg3knp0-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require', 
    ssl: { rejectUnauthorized: false },
})