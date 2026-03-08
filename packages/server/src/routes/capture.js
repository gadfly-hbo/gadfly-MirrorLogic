import express from 'express';
import llmProvider from '../llm/openai-provider.js';
import { v4 as uuidv4 } from 'uuid';
import { writeDb, readDb } from '../models/db.js';

const router = express.Router();

router.post('/analyze', async (req, res) => {
    const { text, name } = req.body;

    if (!text || text.trim().length < 10) {
        return res.status(400).json({ error: '文本内容过短，无法提取人格特征。' });
    }

    const prompt = `请作为顶级的行为心理学家，分析以下该对象的历史聊天记录、邮件或发言文本。
你的任务是根据文本倒推该对象的 PLS 核心防御参数（0-100）：
- P(Power - 权力意志/控制欲)：高则喜欢命令、主导对话，低则随和顺从。
- L(Logic - 逻辑权重/数据导向)：高则严谨、看重数据与因果，低则凭直觉。
- S(Stability - 安全冗余/风险厌恶)：高则保守怕出错、需要退路，低则爱冒险。
- E(Empathy - 共情开合/情绪内核)：高则重感情、容易被情绪感染，低则冷漠分离。

目标对象文本内容：
"${text}"

请严格按照 JSON 格式输出，不要带其他多余解释（数值必须为 0-100 的整数）：
{
  "P": 80,
  "L": 60,
  "S": 50,
  "E": 40,
  "reasoning": "简短的一句话分析理由"
}
`;

    try {
        const response = await llmProvider.generateChatResponse([{ role: 'user', content: prompt }], false);
        let content = response.choices[0].message.content.trim();

        if (content.startsWith('\`\`\`json')) content = content.replace(/^\`\`\`json\s*/, '').replace(/\s*\`\`\`$/, '');
        else if (content.startsWith('\`\`\`')) content = content.replace(/^\`\`\`\s*/, '').replace(/\s*\`\`\`$/, '');

        const parsed = JSON.parse(content);

        // Save to DB
        const db = readDb();
        const newPersona = {
            id: uuidv4(),
            name: name || `文本解析人格 (${parsed.P}/${parsed.L}/${parsed.S})`,
            createdAt: new Date().toISOString(),
            pls_p: parsed.P,
            pls_l: parsed.L,
            pls_s: parsed.S,
            pls_e: parsed.E,
            history: []
        };
        db.personas.push(newPersona);
        writeDb(db);

        res.json(newPersona);
    } catch (err) {
        console.error('Data Capture Parse Error:', err);
        res.status(500).json({ error: '文本深度分析失败，请检查文本重试。' });
    }
});

export default router;
