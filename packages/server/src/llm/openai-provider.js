import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 统一使用 DEEPSEEK 命名，保持向后兼容
const apiKey = process.env.DEEPSEEK_API_KEY || process.env.LLM_API_KEY || process.env.MINIMAX_API_KEY;
const baseURL = process.env.DEEPSEEK_BASE_URL || process.env.LLM_BASE_URL || process.env.MINIMAX_BASE_URL || 'https://api.deepseek.com/v1';
const defaultModel = process.env.DEEPSEEK_MODEL || process.env.LLM_MODEL || 'deepseek-chat';

if (!apiKey) {
    console.error('[错误] 缺失 LLM API Key (DEEPSEEK_API_KEY)! 服务将无法进行策略推演。');
}

console.log(`[LLM] 模型: ${defaultModel}, 端点: ${baseURL}`);

const openai = apiKey ? new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
}) : null;

export async function generateChatResponse(messages, stream = false, options = {}) {
    if (!openai) {
        throw new Error('LLM Provider 未初始化，请检查 DEEPSEEK_API_KEY 环境变量');
    }
    try {
        const completion = await openai.chat.completions.create({
            model: defaultModel,
            messages: messages,
            stream: stream,
            temperature: 0.7,
            max_tokens: 2048, // 增加上限，防止复杂 JSON 截断
            ...options
        });

        return completion;
    } catch (error) {
        console.error('[LLM Error]', error);
        throw error;
    }
}

export default { generateChatResponse };
