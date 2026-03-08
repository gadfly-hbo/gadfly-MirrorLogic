import express from 'express';
import { PersonaModel } from '../models/persona.js';
import { generateSystemPrompt, generateMetricsPrompt } from '../engines/pls-engine.js';
import llmProvider from '../llm/openai-provider.js';
import { readDb, writeDb } from '../models/db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// 创建沙盘会话
router.post('/create', (req, res) => {
    try {
        const { personaId, scenario } = req.body;
        const persona = PersonaModel.findById(personaId);

        if (!persona) return res.status(404).json({ error: 'Persona not found' });

        const sessionId = uuidv4();
        const db = readDb();

        const newSession = {
            id: sessionId,
            personaId,
            scenario: scenario || 'default_negotiation',
            mode: 'standard',
            live_metrics: {
                currentSuccessRate: 0.3,
                emotionalResistance: 0.5,
                trustLevel: 0.2,
                turnsCount: 0
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        db.sandbox_sessions.push(newSession);
        writeDb(db);

        res.json(newSession);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 获取会话消息历史
router.get('/:id/messages', (req, res) => {
    try {
        const db = readDb();
        const messages = db.session_messages
            .filter(m => m.session_id === req.params.id)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 执行聊天回合 (支持流式响应 SSE)
router.post('/:id/chat', async (req, res) => {
    const { content, mode } = req.body;
    const sessionId = req.params.id;

    try {
        const db = readDb();
        const session = db.sandbox_sessions.find(s => s.id === sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });

        const persona = PersonaModel.findById(session.personaId);

        // 1. 保存用户的消息
        const userMessage = {
            id: uuidv4(),
            session_id: sessionId,
            role: 'user',
            content,
            timestamp: new Date().toISOString()
        };
        db.session_messages.push(userMessage);

        // 2. 获取历史消息构建上下文
        const history = db.session_messages
            .filter(m => m.session_id === sessionId)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            .map(m => ({
                role: m.role === 'twin' ? 'assistant' : m.role,
                content: m.content
            }));

        let systemPrompt = generateSystemPrompt(persona);
        if (mode === 'devil') {
            systemPrompt += `

【杠精模式已激活】你现在极度暴躁、挑剔、不留情面。
对方说的每一句话你都要找毛病。绝不轻易让步。
但你的回复依然必须简洁有力（3-5句），不要啰嗦。`;
        }

        const roleplayMessages = [
            { role: 'system', content: systemPrompt },
            ...history
        ];

        // 3. 设置流式响应头
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        // ===== 第一次 LLM 调用：纯角色扮演（非流式，保证完整清理后输出） =====
        const completion = await llmProvider.generateChatResponse(roleplayMessages, false);
        let aiResponseContent = completion.choices[0]?.message?.content || '';

        // 深度清洗结巴与短词重复（后处理防御）
        function cleanStutter(input) {
            let result = input.trim();
            // 循环处理，直到不再有任何这种短词/短句结巴，1-15字长度跨度
            let limit = 0;
            while (limit < 5) {
                let next = result.replace(/(.{1,15}?)\1+/g, '$1');
                if (next === result) break;
                result = next;
                limit++;
            }
            // 修复连着出现的中文及英文标点
            result = result.replace(/([。！？，、；：.,!?])\1+/g, '$1');
            return result;
        }

        const cleanContent = cleanStutter(aiResponseContent);

        console.log("=== RAW AI ===", aiResponseContent);
        console.log("=== CLEANED AI ===", cleanContent);

        // 人工模拟流式输出（发送到前端），确保打字机效果，屏蔽模型自身生成的抽搐
        const chars = Array.from(cleanContent); // 支持中文字符的安全拆解
        for (let i = 0; i < chars.length; i++) {
            res.write(`data: ${JSON.stringify({ type: 'chunk', content: chars[i] })}\n\n`);
            // 模拟人类输出/网络流随机间隔 (5~20ms)
            await new Promise(r => setTimeout(r, Math.floor(Math.random() * 15) + 5));
        }

        // 保存 AI 回复
        const aiMessage = {
            id: uuidv4(),
            session_id: sessionId,
            role: 'twin',
            content: cleanContent,
            timestamp: new Date().toISOString(),
            metrics_json: '{}'
        };
        db.session_messages.push(aiMessage);

        // ===== 第二次 LLM 调用：独立指标评估（非流式） =====
        let turnMetrics = { successDelta: 0, emotionFriction: 0, triggers: [] };
        try {
            const metricsPrompt = generateMetricsPrompt(persona, content, aiResponseContent.trim());
            const metricsResponse = await llmProvider.generateChatResponse(
                [{ role: 'user', content: metricsPrompt }],
                false
            );
            let metricsText = metricsResponse.choices[0].message.content.trim();
            // 清除可能的 markdown 包裹
            metricsText = metricsText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
            const parsed = JSON.parse(metricsText);
            turnMetrics = {
                successDelta: parsed.successDelta || 0,
                emotionFriction: parsed.emotionFriction || 0,
                triggers: parsed.triggers || []
            };
        } catch (metricsErr) {
            console.error('[Metrics Eval Error]', metricsErr.message);
            // 回退默认值，不影响主流程
        }

        // 更新 session 指标
        session.live_metrics.turnsCount += 1;
        session.live_metrics.currentSuccessRate = Math.max(0, Math.min(1, session.live_metrics.currentSuccessRate + turnMetrics.successDelta));
        session.live_metrics.emotionalResistance = Math.max(0, Math.min(1, session.live_metrics.emotionalResistance + turnMetrics.emotionFriction));

        // 回写指标到消息记录
        aiMessage.metrics_json = JSON.stringify(turnMetrics);
        writeDb(db);

        // 推送最终更新的指标并结束 SSE
        res.write(`data: ${JSON.stringify({ type: 'done', metrics: session.live_metrics, messageId: aiMessage.id, triggers: turnMetrics.triggers })}\n\n`);
        res.end();
    } catch (error) {
        console.error('Chat Error:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
        res.end();
    }
});

export default router;
