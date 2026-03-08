import { readDb, writeDb } from './db.js';
import { v4 as uuidv4 } from 'uuid';

export class PersonaModel {
    static create(data) {
        const { name, relationship, capture_method, pls_p, pls_l, pls_s, pls_e, dynamics, contextWeights } = data;
        const id = uuidv4();

        const newPersona = {
            id,
            name,
            relationship: relationship || null,
            capture_method: capture_method || 'probe',
            pls_p: pls_p || 50,
            pls_l: pls_l || 50,
            pls_s: pls_s || 50,
            pls_e: pls_e || 50,
            dynamics: dynamics || {},
            contextWeights: contextWeights || {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const db = readDb();
        db.personas.push(newPersona);
        writeDb(db);

        return newPersona;
    }

    static findById(id) {
        const db = readDb();
        const persona = db.personas.find(p => p.id === id);
        return persona || null;
    }

    static findAll() {
        const db = readDb();
        // 按照更新时间倒序
        return db.personas.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    }
}
