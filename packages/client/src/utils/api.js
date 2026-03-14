import { v4 as uuidv4 } from 'uuid';

// 根据环境自动切换 API 基础路径
const API_BASE = import.meta.env.VITE_API_URL || '';

// 获取或生成客户端唯一匿名标识 (Device ID)
export const getDeviceId = () => {
    let deviceId = localStorage.getItem('mirrorlogic_device_id');
    if (!deviceId) {
        deviceId = uuidv4();
        localStorage.setItem('mirrorlogic_device_id', deviceId);
        console.log('[System] Initialized new anonymous Device ID:', deviceId);
    }
    return deviceId;
};

export function apiUrl(path) {
    // 自动在所有发向后端的请求追加 deviceId 用于多用户隔离
    const url = new URL(`${API_BASE}${path}`, window.location.origin);
    url.searchParams.append('deviceId', getDeviceId());
    return url.toString().replace(window.location.origin, ''); // 保持开发环境下的相对路径兼容性
}

export default API_BASE;
