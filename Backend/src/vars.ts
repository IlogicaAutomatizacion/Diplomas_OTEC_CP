import 'dotenv/config'
import fs from 'fs';

export const PORT = process.env.PORT || 3000
export const client_id = process.env.CLIENT_ID
export const client_secret = process.env.CLIENT_SECRET
export const refresh_token = process.env.REFRESH_TOKEN

export const GOOGLE_CREDENTIALS = process.env.GOOGLE_CREDENTIALS || fs.readFileSync('./credenciales.json', 'utf-8')
export const FRONT = process.env.FRONT || 'http://localhost:5173'