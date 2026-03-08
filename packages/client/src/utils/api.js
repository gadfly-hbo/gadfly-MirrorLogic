// 根据环境自动切换 API 基础路径
// 本地开发：使用 Vite DevServer 代理，直接 /api/...
// 生产环境：使用环境变量 VITE_API_URL 指向云端后端服务
const API_BASE = import.meta.env.VITE_API_URL || '';

export function apiUrl(path) {
    // path 必须以 / 开头，如 '/api/personas'
    return `${API_BASE}${path}`;
}

export default API_BASE;
