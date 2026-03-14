import express from 'express';
import { getStrategyFramework } from '../engines/strategy-engine.js';
import { PersonaModel } from '../models/persona.js';
import llmProvider from '../llm/openai-provider.js';
import { readDb, writeDb } from '../models/db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.get('/framework/:personaId', (req, res) => {
    try {
        const persona = PersonaModel.findById(req.params.personaId);
        if (!persona) return res.status(404).json({ error: 'Persona not found' });
        const strategy = getStrategyFramework(persona);
        res.json(strategy);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/transform', async (req, res) => {
    try {
        const { personaId, rawInput, scenario } = req.body;
        const deviceId = req.query.deviceId || 'anonymous'; // 接收前端传来的标识
        const persona = PersonaModel.findById(personaId);
        if (!persona) return res.status(404).json({ error: 'Persona not found' });

        const strategy = getStrategyFramework(persona);

        const prompt = `
你现在是顶级的商业沟通与心理学谈判教练。你的客户遇到一个棘手的沟通对象，其核心反应参数（0-100）如下：
- P(控制欲, 喜爱被请示): ${persona.pls_p}
- L(逻辑性, 数据导向): ${persona.pls_l}
- S(风险厌恶, 需冗余感): ${persona.pls_s}
- E(感性共鸣, 需被理解): ${persona.pls_e}

当前推荐的强力沟通框架为: ${strategy.framework}。核心建议：${strategy.toneAdvice}

【客户原本想说的大白话 (可能充满雷点)】：
${rawInput}

【场景辅助信息】：${scenario || '日常交锋/谈判'}

【你的任务】：
请立刻将这句大白话说教成且只能输出 3 种完全不同风格战术的话术（不要解释框架，直接输出干货），要求严格格式化为 JSON 输出：
{
  "custom_framework": "针对此场景的具体策略思路（基于对方的PLS特征分析为什么原话不可行，以及正确的沟通框架逻辑）",
  "key_flaws": ["这句话的第一个致命伤: 没有数据支撑", "这句话的第二个致命伤: 语气过于挑战权威"],
  "A": { "style": "激进压制型/结论先行 (主攻高P/高L痛点)", "script": "这里是话术内容..." },
  "B": { "style": "温和引导型/防守垫层 (安抚其高S防线，建立共商机制)", "script": "..." },
  "C": { "style": "利益互换型/以进为退 (给出无法轻易拒绝的 ROI 代价)", "script": "..." }
}
务必仅返回这一个 JSON 对象，不要加上额外的标记或解释。
`;

        const messages = [{ role: 'user', content: prompt }];
        // 不再强制启用 JSON Mode (部分模型供应商 SDK 兼容性可能存在问题)
        const completion = await llmProvider.generateChatResponse(messages, false);
        let textOutput = completion.choices[0].message.content.trim();

        console.log(`[DEBUG] LLM Transform Raw Output Length: ${textOutput.length}`);
        const parseRobustJson = (text) => {
            let jsonStr = text;
            try {
                // 1. 尝试直接解析
                return JSON.parse(text);
            } catch (e) {
                // 2. 尝试提取最外层 { }
                const match = text.match(/\{[\s\S]*\}/);
                if (!match) throw new Error("无法在输出中找到 JSON 结构");
                
                jsonStr = match[0];
                
                // 3. 清理常见的 LLM JSON 格式错误
                jsonStr = jsonStr
                    .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*/g, '$1') // 移除注释，但避开 URL 中的 //
                    .replace(/,\s*([\}\]])/g, '$1') // 去除对象/数组末尾的冗余逗号
                    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // 移除非法控制字符
                
                try {
                    return JSON.parse(jsonStr);
                } catch (e2) {
                    // 4. 极端情况：处理内部未转义的换行
                    // 注意：这只是一个脆弱的尝试，仅针对字符串值内部的硬回车
                    const fixedJson = jsonStr.replace(/"([^"]*)"/g, (m, p1) => {
                        return '"' + p1.replace(/\n/g, "\\n").replace(/\r/g, "\\r") + '"';
                    });
                    return JSON.parse(fixedJson);
                }
            }
        };

        try {
            const resultObj = parseRobustJson(textOutput);
            
            const db = readDb();
            // 兼容老版本DB文件缺少 strategy_records 数组的情况
            if (!db.strategy_records) db.strategy_records = [];
            
            const newRecord = {
                id: uuidv4(),
                personaId: personaId,
                userId: deviceId, 
                scenario: scenario || '日常交锋/谈判',
                rawInput: rawInput,
                result: resultObj,
                created_at: new Date().toISOString()
            };
            
            db.strategy_records.push(newRecord);
            writeDb(db);
            // ======================================================= //

            return res.json(resultObj);
        } catch (parseErr) {
            console.error('JSON Parse fail on LLM transform. Raw Output:', textOutput);
            console.error('Parse Error Detail:', parseErr.message);
            return res.status(500).json({ 
                error: '大模型返回格式解析失败，请点击重试', 
                detail: parseErr.message,
                rawOutput: textOutput 
            });
        }

    } catch (err) {
        console.error('[Strategy Transform Error]', err);
        res.status(500).json({ error: err.message });
    }
});

// 新增 GET 路由：获取策略历史记录
router.get('/history/:personaId', (req, res) => {
    try {
        const deviceId = req.query.deviceId || 'anonymous';
        const db = readDb();
        if (!db.strategy_records) {
            return res.json([]);
        }
        
        const records = db.strategy_records
            .filter(r => r.personaId === req.params.personaId && r.userId === deviceId)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // 时间倒序
            
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 新增 DELETE 路由：删除指定策略记录
router.delete('/history/:recordId', (req, res) => {
    try {
        const deviceId = req.query.deviceId || 'anonymous';
        const db = readDb();
        if (!db.strategy_records) return res.json({ success: true });
        
        const initialLen = db.strategy_records.length;
        // 只能删除匹配 deviceId 的记录，兼顾安全性
        db.strategy_records = db.strategy_records.filter(
            r => !(r.id === req.params.recordId && r.userId === deviceId)
        );
        
        if (db.strategy_records.length !== initialLen) {
            writeDb(db);
        }
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
