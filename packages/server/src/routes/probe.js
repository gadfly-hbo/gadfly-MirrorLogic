import express from 'express';
import { PROBE_QUESTIONS, calculatePLS } from '../engines/probe-engine.js';
import { PersonaModel } from '../models/persona.js';

const router = express.Router();

// 获取探针问题列表
router.get('/questions', (req, res) => {
    try {
        // 为防止作弊或预判，可以打乱选项顺序（如果需要），并且去除 impact 分值返回给前端
        const safeQuestions = PROBE_QUESTIONS.map(q => ({
            id: q.id,
            scenario: q.scenario,
            options: q.options.map(opt => ({ text: opt.text })) // 隐藏 impact
        }));

        res.json(safeQuestions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 提交答案，生成并保存 Persona
router.post('/analyze', (req, res) => {
    try {
        const { answers, personaName, relationship } = req.body;

        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ error: '无效的答案格式' });
        }

        // 计算 PLS 值
        const plsResult = calculatePLS(answers);

        // 存入数据库
        const newPersona = PersonaModel.create({
            name: personaName || '未知目标',
            relationship: relationship || '未定义关系',
            capture_method: 'probe',
            pls_p: plsResult.P,
            pls_l: plsResult.L,
            pls_s: plsResult.S,
            pls_e: plsResult.E
        });

        res.status(201).json(newPersona);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
