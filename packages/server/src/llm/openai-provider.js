import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

// 优先使用新的 LLM_ 前缀环境变量，向后兼容 MINIMAX_ 前缀
const apiKey = process.env.LLM_API_KEY || process.env.MINIMAX_API_KEY;
const baseURL = process.env.LLM_BASE_URL || process.env.MINIMAX_BASE_URL || 'https://api.minimax.chat/v1';
const defaultModel = process.env.LLM_MODEL || process.env.MINIMAX_MODEL || 'abab6.5s-chat';

console.log(`[LLM] 模型: ${defaultModel}, 端点: ${baseURL}`);

const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
});

export async function generateChatResponse(messages, stream = false) {
    try {
        const completion = await openai.chat.completions.create({
            model: defaultModel,
            messages: messages,
            stream: stream,
            temperature: 0.7,
            max_tokens: 1024,
        });

        return completion;
    } catch (error) {
        console.error('[LLM Error]', error);
        throw error;
    }
}

export default { generateChatResponse };
