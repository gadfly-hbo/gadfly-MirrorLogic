import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultDataDir = path.join(__dirname, '../../data');
const dbPath = process.env.DATABASE_PATH || path.join(defaultDataDir, 'db.json');
const dataDir = path.dirname(dbPath);

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// 初始化 JSON DB
function initDb() {
    if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify({
            personas: [],
            sandbox_sessions: [],
            session_messages: []
        }, null, 2));
    }
}

initDb();

export function readDb() {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
}

export function writeDb(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export default { readDb, writeDb };
