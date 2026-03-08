import express from 'express';
import { readDb } from '../models/db.js';
import { PersonaModel } from '../models/persona.js';

const router = express.Router();

// 获取特定对象的洞察数据
router.get('/:personaId', (req, res) => {
    try {
        const persona = PersonaModel.findById(req.params.personaId);
        if (!persona) return res.status(404).json({ error: 'Persona not found' });

        const db = readDb();
        const sessions = db.sandbox_sessions.filter(s => s.personaId === req.params.personaId);

        if (sessions.length === 0) {
            return res.json({
                totalSessions: 0,
                averageSuccessRate: 0,
                averageFriction: 0,
                recentTriggers: [],
                message: '暂无推演数据，请先进入博弈沙盘完成至少一次对话'
            });
        }

        // 计算总平均值
        let sumSuccess = 0;
        let sumFriction = 0;
        let turnsSum = 0;
        const sessionIds = sessions.map(s => s.id);

        sessions.forEach(s => {
            sumSuccess += s.live_metrics.currentSuccessRate || 0.3;
            sumFriction += s.live_metrics.emotionalResistance || 0;
            turnsSum += s.live_metrics.turnsCount || 0;
        });

        const averageSuccessRate = sumSuccess / sessions.length;
        const averageFriction = sumFriction / sessions.length;

        // 抓取近期的 Triggers 统计
        const allRecentMessages = db.session_messages
            .filter(m => sessionIds.includes(m.session_id) && m.role === 'twin')
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 50); // 近 50 条

        const triggerCounts = {};
        allRecentMessages.forEach(msg => {
            if (msg.metrics_json) {
                try {
                    const metrics = JSON.parse(msg.metrics_json);
                    if (metrics.triggers && Array.isArray(metrics.triggers)) {
                        metrics.triggers.forEach(t => {
                            triggerCounts[t] = (triggerCounts[t] || 0) + 1;
                        });
                    }
                } catch (e) { }
            }
        });

        const recentTriggers = Object.entries(triggerCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // 最常触发的 5 个雷点

        // 取最后 5 次推演的成功率趋势
        const trendData = sessions
            .slice(-5)
            .map((s, idx) => ({
                label: `推演 ${idx + 1}`,
                successRate: s.live_metrics.currentSuccessRate,
                turnCount: s.live_metrics.turnsCount
            }));

        res.json({
            personaId: persona.id,
            personaName: persona.name,
            totalSessions: sessions.length,
            averageSuccessRate,
            averageFriction,
            avgTurns: turnsSum / sessions.length,
            recentTriggers,
            trendData
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
