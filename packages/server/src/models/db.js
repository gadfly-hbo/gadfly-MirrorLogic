import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultDataDir = path.join(__dirname, '../../data');
let dbPath = process.env.DATABASE_PATH || path.join(defaultDataDir, 'db.json');
const dataDir = path.dirname(dbPath);

console.log(`[数据库] 尝试初始化路径: ${dbPath}`);

// Ensure the data directory exists
function ensureDataDirectory() {
    if (!fs.existsSync(dataDir)) {
        try {
            console.log(`[数据库] 创建数据目录: ${dataDir}`);
            fs.mkdirSync(dataDir, { recursive: true });
        } catch (err) {
            console.error(`[警告] 目录创建失败 (${dataDir}): ${err.message}`);
            // Attempt to auto-correct path to /tmp (for public clouds without persistent storage)
            if (!process.env.DATABASE_PATH) {
                console.log('[数据库] 自动切换至临时存储路径...');
                dbPath = path.join('/tmp', 'db.json');
                // Re-evaluate dataDir based on new dbPath
                const newTempDataDir = path.dirname(dbPath);
                if (!fs.existsSync(newTempDataDir)) {
                    try {
                        console.log(`[数据库] 创建临时数据目录: ${newTempDataDir}`);
                        fs.mkdirSync(newTempDataDir, { recursive: true });
                    } catch (tempErr) {
                        console.error(`[严重错误] 临时目录创建失败 (${newTempDataDir}): ${tempErr.message}`);
                        process.exit(1); // Exit if even temporary directory cannot be created
                    }
                }
            } else {
                process.exit(1); // Exit if specified DATABASE_PATH directory cannot be created
            }
        }
    }
}

ensureDataDirectory();

// Initialize JSON DB
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
