import React, { useState, useEffect, useRef } from 'react';
import useStore from '../store';
import { apiUrl } from '../utils/api.js';

export default function SandboxChat({ onExit }) {
    const { currentPersona } = useStore();
    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isDevilMode, setIsDevilMode] = useState(false);
    const [metrics, setMetrics] = useState({
        currentSuccessRate: 0.3,
        emotionalResistance: 0.5,
        trustLevel: 0.2
    });
    const [latestTriggers, setLatestTriggers] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        // 创建会话
        async function createSession() {
            try {
                const res = await fetch(apiUrl('/api/sandbox/create'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ personaId: currentPersona.id })
                });
                const data = await res.json();
                setSession(data);
                setMetrics(data.live_metrics);
                setMessages([{
                    id: 'welcome',
                    role: 'system',
                    content: `已接入对象：${currentPersona.name} 的 PLS 核心逻辑。模拟开始，对方正在评估你的第一句话。`
                }]);
            } catch (err) {
                console.error(err);
            }
        }
        createSession();
    }, [currentPersona]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !session || isTyping) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: userMsg }]);
        setIsTyping(true);

        try {
            const response = await fetch(apiUrl(`/api/sandbox/${session.id}/chat`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: userMsg, mode: isDevilMode ? 'devil' : 'standard' })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');

            // 准备接收 AI 回复
            setMessages(prev => [...prev, { id: 'streaming', role: 'twin', content: '' }]);

            let done = false;
            let buffer = '';
            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                if (value) {
                    buffer += decoder.decode(value, { stream: true });
                    const parts = buffer.split('\n\n');
                    buffer = parts.pop(); // 保留不完整的末尾部分

                    for (let part of parts) {
                        const lines = part.split('\n');
                        for (let line of lines) {
                            if (line.startsWith('data: ')) {
                                const dataStr = line.replace('data: ', '');
                                try {
                                    const data = JSON.parse(dataStr);
                                    if (data.type === 'chunk') {
                                        setMessages(prev => {
                                            const newMsgs = prev.slice(0, -1);
                                            const lastMsg = prev[prev.length - 1];
                                            return [...newMsgs, { ...lastMsg, content: lastMsg.content + data.content }];
                                        });
                                    } else if (data.type === 'replace') {
                                        // 后端去重后发送的替换内容
                                        setMessages(prev => {
                                            const newMsgs = prev.slice(0, -1);
                                            const lastMsg = prev[prev.length - 1];
                                            return [...newMsgs, { ...lastMsg, content: data.content }];
                                        });
                                    } else if (data.type === 'done') {
                                        setMetrics(data.metrics);
                                        // 解析 triggers 来做实时反馈提示
                                        if (data.triggers) {
                                            setLatestTriggers(data.triggers);
                                        }
                                        // 将临时 id 换成真实 messageId
                                        setMessages(prev => {
                                            const newMsgs = prev.slice(0, -1);
                                            const lastMsg = prev[prev.length - 1];
                                            return [...newMsgs, { ...lastMsg, id: data.messageId }];
                                        });
                                    } else if (data.type === 'error') {
                                        setMessages(prev => {
                                            const newMsgs = prev.slice(0, -1);
                                            const lastMsg = prev[prev.length - 1];
                                            return [...newMsgs, { ...lastMsg, content: `[系统报错] ${data.message || 'API 请求失败或网络异常，请检查后端服务'}` }];
                                        });
                                    }
                                } catch (e) {
                                    // Ignore Parse Error
                                }
                            }
                        }
                    }
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsTyping(false);
        }
    };

    const toPercent = (val) => Math.round(val * 100) + '%';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '80vh', maxWidth: '900px', width: '100%', border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden', background: 'var(--bg-card)' }}>
            {/* Header */}
            <div style={{ padding: '1rem', background: 'var(--bg-card-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ margin: 0 }}>
                    <span style={{ color: 'var(--color-p)', marginRight: '8px' }}>●</span>
                    {currentPersona.name} [PLS 实时推演沙盘]
                </h3>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => setIsDevilMode(!isDevilMode)}
                        style={{ padding: '4px 12px', background: isDevilMode ? '#e11d48' : 'transparent', color: isDevilMode ? 'white' : 'var(--text-secondary)', border: `1px solid ${isDevilMode ? '#e11d48' : 'var(--border-color)'}`, borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {isDevilMode ? '🔥 杠精模式进行中' : '🛡️ 激活杠精模式'}
                    </button>
                    <button onClick={onExit} style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--text-muted)', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px' }}>
                        结束推演
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Chat Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-color)' }}>
                    <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {messages.map(msg => (
                            <div key={msg.id} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                                    {msg.role === 'system' ? 'System' : (msg.role === 'user' ? 'You' : currentPersona.name)}
                                </div>
                                <div style={{
                                    padding: '12px 16px',
                                    borderRadius: '4px',
                                    background: msg.role === 'system' ? 'rgba(255,255,255,0.05)' : (msg.role === 'user' ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-main)'),
                                    border: `1px solid ${msg.role === 'user' ? 'var(--color-p)' : 'var(--border-color)'}`,
                                    color: msg.role === 'system' ? 'var(--text-secondary)' : 'var(--text-primary)',
                                    lineHeight: '1.5'
                                }}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isTyping && <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)' }}>对方正在输入...</div>}
                    </div>

                    <form onSubmit={sendMessage} style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="输入你的话术，测试对方反应..."
                            style={{ flex: 1, padding: '12px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', outline: 'none' }}
                            disabled={isTyping}
                        />
                        <button type="submit" disabled={isTyping || !input.trim()} style={{ padding: '0 20px', borderRadius: '4px', background: 'var(--color-p)', color: 'white', border: 'none', cursor: isTyping ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                            发送
                        </button>
                    </form>
                </div>

                {/* Metrics Side Panel */}
                <div style={{ width: '280px', padding: '1.5rem', background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div>
                        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)' }}>实时推演指标</h4>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--color-s)' }}>预估成功率 (P_success)</span>
                                <span style={{ fontWeight: 'bold', color: 'white' }}>{toPercent(metrics.currentSuccessRate)}</span>
                            </div>
                            <div style={{ height: '8px', background: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: toPercent(metrics.currentSuccessRate), height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', transition: 'width 0.5s ease' }} />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--color-e)' }}>情绪阻力值 (Friction)</span>
                                <span style={{ fontWeight: 'bold', color: 'white' }}>{toPercent(metrics.emotionalResistance)}</span>
                            </div>
                            <div style={{ height: '8px', background: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: toPercent(metrics.emotionalResistance), height: '100%', background: 'linear-gradient(90deg, #f43f5e, #fb7185)', transition: 'width 0.5s ease' }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1.5rem' }}>
                        <h5 style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)' }}>对方防御判定雷达</h5>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            <li style={{ marginBottom: '8px' }}>⚠️ 权威敏感度: {currentPersona.pls_p > 70 ? '极高' : '一般'}</li>
                            <li style={{ marginBottom: '8px' }}>🛡️ 失败厌恶度: {currentPersona.pls_s > 70 ? '极高' : '一般'}</li>
                            <li>🔍 逻辑要求: {currentPersona.pls_l > 70 ? '硬性数据驱动' : '可感性说服'}</li>
                        </ul>

                        <h5 style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)' }}>最近一次触发的防御机制</h5>
                        {latestTriggers.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {latestTriggers.map((t, idx) => (
                                    <span key={idx} style={{ padding: '4px 8px', background: 'rgba(244, 63, 94, 0.2)', color: '#fb7185', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid rgba(244, 63, 94, 0.5)' }}>
                                        🚨 {t}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>✓ 话术处于安全区间</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
