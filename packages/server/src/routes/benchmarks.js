import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readDb, writeDb } from '../models/db.js';

const router = express.Router();

const benchmarkPersonas = [
    {
        name: "狼性初创 CEO (只看ROI)",
        tags: ["🎯 结果导向", "🔥 强压迫"],
        description: "训练目的：电梯演讲与利益向上绑定。P与L极高，毫无耐心。不要跟他谈苦劳，必须用数字和ROI证明价值。",
        pls_p: 90, pls_l: 85, pls_s: 30, pls_e: 15
    },
    {
        name: "保守体制内/存量管理者",
        tags: ["🧱 铁饭碗", "🛡️ 风险厌恶"],
        description: "训练目的：风险对冲与责任分割。安全冗余度（S值）封顶。不能用“大饼”忽悠，需要为他提供明确的避险垫和退路。",
        pls_p: 85, pls_l: 40, pls_s: 90, pls_e: 50
    },
    {
        name: "硅谷极客型技术总监",
        tags: ["💻 代码至上", "📊 数据狂魔"],
        description: "训练目的：硬核数据支撑与金字塔原理。极度看重逻辑与事实。如果尝试用情绪或主管形容词沟通，会被立刻否决。",
        pls_p: 60, pls_l: 95, pls_s: 40, pls_e: 20
    },
    {
        name: "情感纽带型核心合伙人",
        tags: ["❤️ NVC沟通", "🪞 情绪价值"],
        description: "训练目的：非暴力沟通与共情回路。这里不能只谈对错和数字。如果忽略了对方的情绪诉求，逻辑再严密也会产生抵抗。",
        pls_p: 30, pls_l: 40, pls_s: 60, pls_e: 95
    }
];

router.get('/load', (req, res) => {
    try {
        const db = readDb();
        const loadedPersonas = benchmarkPersonas.map(b => ({
            id: uuidv4(),
            name: b.name,
            tags: b.tags || [],
            description: b.description || '',
            createdAt: new Date().toISOString(),
            pls_p: b.pls_p,
            pls_l: b.pls_l,
            pls_s: b.pls_s,
            pls_e: b.pls_e,
            history: []
        }));

        db.personas.push(...loadedPersonas);
        writeDb(db);

        res.json({ success: true, count: loadedPersonas.length, personas: loadedPersonas });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
