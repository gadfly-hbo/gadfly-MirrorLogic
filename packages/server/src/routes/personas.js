import express from 'express';
import { PersonaModel } from '../models/persona.js';

const router = express.Router();

// GET /api/personas
router.get('/', (req, res) => {
    try {
        const personas = PersonaModel.findAll();
        res.json(personas);
    } catch (error) {
        res.status(500).json({ error: '获取镜像列表失败', details: error.message });
    }
});

// GET /api/personas/:id
router.get('/:id', (req, res) => {
    try {
        const persona = PersonaModel.findById(req.params.id);
        if (!persona) return res.status(404).json({ error: '找不到指定镜像' });
        res.json(persona);
    } catch (error) {
        res.status(500).json({ error: '获取镜像失败', details: error.message });
    }
});

// POST /api/personas
router.post('/', (req, res) => {
    try {
        const newPersona = PersonaModel.create(req.body);
        res.status(201).json(newPersona);
    } catch (error) {
        res.status(500).json({ error: '创建镜像失败', details: error.message });
    }
});

// POST /api/personas/random
router.post('/random', (req, res) => {
    try {
        const adjectives = ["暴躁的", "固执的", "佛系的", "极致细节的", "画大饼的", "焦虑的", "极度自我的", "敏感多疑的", "结果导向的", "不讲理的"];
        const roles = ["部门主管", "产品总监", "实习生", "大客户", "投资人", "研发大佬", "财务VP", "合作方老板", "你的直属上司"];

        const randomName = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${roles[Math.floor(Math.random() * roles.length)]}`;

        // Randomly assign dominant traits to make the persona "spiky" rather than flat
        const mainTrait = Math.random();
        let p = Math.floor(Math.random() * 50) + 20;
        let l = Math.floor(Math.random() * 50) + 20;
        let s = Math.floor(Math.random() * 50) + 20;
        let e = Math.floor(Math.random() * 50) + 20;

        if (mainTrait < 0.25) p = Math.floor(Math.random() * 20) + 80;
        else if (mainTrait < 0.5) l = Math.floor(Math.random() * 20) + 80;
        else if (mainTrait < 0.75) s = Math.floor(Math.random() * 20) + 80;
        else e = Math.floor(Math.random() * 20) + 80;

        const newPersona = PersonaModel.create({
            name: `${randomName} (随机盲测)`,
            tags: ["🎲 随机生成", "未知属性"],
            description: "这是一个属性未知的盲盒沟通对象，在实战推演中观察面板变化来摸索其性格底牌。",
            pls_p: p,
            pls_l: l,
            pls_s: s,
            pls_e: e
        });
        res.status(201).json(newPersona);
    } catch (error) {
        res.status(500).json({ error: '生成随机镜像失败', details: error.message });
    }
});

export default router;
