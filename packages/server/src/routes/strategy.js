import express from 'express';
import { getStrategyFramework } from '../engines/strategy-engine.js';
import { PersonaModel } from '../models/persona.js';
import llmProvider from '../llm/openai-provider.js';

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
务必仅返回这一个JSON对象，不要加上反引号或额外的标记，便于后端直接解析。
`;

        const messages = [{ role: 'user', content: prompt }];
        const completion = await llmProvider.generateChatResponse(messages, false);
        let textOutput = completion.choices[0].message.content.trim();

        // 容错处理：MiniMax 有时还是会包裹 ```json
        if (textOutput.startsWith('\`\`\`json')) {
            textOutput = textOutput.replace(/^\`\`\`json\s*/, '').replace(/\s*\`\`\`$/, '');
        } else if (textOutput.startsWith('\`\`\`')) {
            textOutput = textOutput.replace(/^\`\`\`\s*/, '').replace(/\s*\`\`\`$/, '');
        }

        try {
            const resultObj = JSON.parse(textOutput);
            return res.json(resultObj);
        } catch (parseErr) {
            console.error('JSON Parse fail on LLM transform:', textOutput);
            return res.status(500).json({ error: '大模型返回格式不是标准的JSON，请重试', rawOutput: textOutput });
        }

    } catch (err) {
        console.error('[Strategy Transform Error]', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
