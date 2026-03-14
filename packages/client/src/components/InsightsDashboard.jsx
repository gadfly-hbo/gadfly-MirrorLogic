import React, { useState, useEffect } from 'react';
import useStore from '../store';
import { apiUrl } from '../utils/api';

export default function InsightsDashboard({ onBack }) {
    const { currentPersona } = useStore();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(apiUrl(`/api/insights/${currentPersona.id}`))
            .then(res => {
                if (!res.ok) throw new Error('网络请求失败: ' + res.status);
                return res.json();
            })
            .then(result => {
                setData(result);
                setLoading(false);
            })
            .catch(err => {
                console.error('洞察数据加载失败:', err);
                setError(err.message);
                setLoading(false);
            });
    }, [currentPersona.id]);

    const toPercent = (val) => Math.round((val || 0) * 100) + '%';

    if (loading) {
        return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>正在同步 {currentPersona.name} 的沙盘数据矩阵...</div>;
    }

    if (error || !data) {
        return (
            <div className="welcome-card" style={{ maxWidth: '800px', width: '100%', textAlign: 'center', borderColor: 'rgba(244, 63, 94, 0.3)' }}>
                <h2 style={{ margin: '0 0 1rem 0', color: '#fb7185' }}>数据加载失败</h2>
                <p style={{ color: 'var(--text-secondary)' }}>您可能尚未完成任何推演，或者网络连接存在异常。</p>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error && `错误信息: ${error}`}</div>
                <button onClick={onBack} style={{ marginTop: '2rem', padding: '10px 20px', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}>返回镜像库</button>
            </div>
        );
    }

    if (data && data.totalSessions === 0) {
        return (
            <div className="welcome-card" style={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>
                <h2 style={{ margin: '0 0 1rem 0' }}>数据空缺</h2>
                <p style={{ color: 'var(--text-secondary)' }}>暂无足够推演数据。请先进入博弈沙盘完成至少一次对话。</p>
                <button onClick={onBack} style={{ marginTop: '2rem', padding: '10px 20px', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}>返回镜像库</button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1000px', gap: '1.5rem' }}>

            {/* 头部区 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                <div>
                    <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>博弈复盘洞察中心 (Insights)</h2>
                    <div style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>
                        当前分析对象: <span style={{ color: 'white', fontWeight: 'bold' }}>{currentPersona.name}</span> | 已累计推演回合: <span style={{ color: 'var(--color-p)' }}>{data.totalSessions} 次</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={onBack} style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', padding: '8px 16px' }}>关闭洞察面板</button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>

                {/* 左侧：核心指标卡片 */}
                <div style={{ flex: '1 1 30%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--color-l)' }} />
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>历史平均预估胜率</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>{toPercent(data.averageSuccessRate)}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8.5rem', marginTop: '0.5rem' }}>低于 60% 意味着你常常在谈判中处于下风</div>
                    </div>

                    <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#fb7185' }} />
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>历史平均情绪阻力</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>{toPercent(data.averageFriction)}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8.5rem', marginTop: '0.5rem' }}>高于 40% 说明你的沟通方式屡次让其感到不悦</div>
                    </div>

                    <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--color-p)' }} />
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>触发最高频防御机制</div>
                        {data.recentTriggers && data.recentTriggers.length > 0 ? (
                            <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {data.recentTriggers.map((t, i) => (
                                    <span key={i} style={{ padding: '6px 12px', background: 'rgba(244, 63, 94, 0.2)', color: '#fb7185', borderRadius: '4px', fontSize: '0.9rem', border: '1px solid rgba(244, 63, 94, 0.5)' }}>
                                        🚨 {t.name} <span style={{ color: 'var(--text-secondary)', marginLeft: '4px' }}>x{t.count}</span>
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div style={{ fontSize: '1.2rem', color: 'var(--color-l)', marginTop: '0.5rem' }}>表现良好，极少踩雷</div>
                        )}
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8.5rem', marginTop: '1rem' }}>请在下次沟通中极力避免触碰上述核心雷区</div>
                    </div>

                </div>

                {/* 右侧：推演趋势图模拟 */}
                <div style={{ flex: '1 1 60%', padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)' }}>近 5 次推演胜率趋势</h3>

                    <div style={{ display: 'flex', height: '300px', alignItems: 'flex-end', justifyContent: 'space-around', paddingTop: '2rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '1rem' }}>
                        {data.trendData && data.trendData.map((t, idx) => {
                            const heightStr = `${Math.max(10, t.successRate * 100)}%`;
                            return (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40px', gap: '10px' }}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{toPercent(t.successRate)}</div>
                                    <div style={{ width: '100%', height: heightStr, background: 'linear-gradient(0deg, var(--color-p), var(--color-l))', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                                        <div style={{ position: 'absolute', bottom: '-25px', width: '60px', left: '-10px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {t.label}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {!data.trendData || data.trendData.length === 0 && (
                            <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-muted)' }}>暂无足够样本</div>
                        )}
                    </div>

                    <div style={{ marginTop: '2.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-l)' }}>💡 教练点评 (AI 综合诊断)</h4>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                            根据你在近期沙盘中对 {currentPersona.name} 的表现分析，建议回到 <strong onClick={onBack} style={{ color: 'white', cursor: 'pointer', textDecoration: 'underline' }}>策略工坊</strong>，针对其 P:{currentPersona.pls_p}/L:{currentPersona.pls_l}/S:{currentPersona.pls_s} 的人格分布，多采纳 "结论先行" 与 "安全补偿" 的话术结构。
                        </p>
                    </div>
                </div>
            </div>

            {/* 新增：详尽对话记录回顾与诊断报告 */}
            <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border-color)', marginTop: '1rem' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    📚 详尽对话记录与诊断报告 (Turn-by-Turn)
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {data.recentSessions && data.recentSessions.map((session, sIdx) => (
                        <div key={session.id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: 'rgba(0,0,0,0.1)' }}>
                            {/* 会话抬头 */}
                            <div style={{ padding: '12px 1.5rem', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span style={{ color: 'var(--color-l)', fontWeight: 'bold' }}>推演记录 #{data.totalSessions - sIdx}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '1rem' }}>场景: {session.scenario}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '1rem' }}>时间: {new Date(session.created_at).toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.9rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>最终胜率: </span>
                                        <span style={{ color: 'var(--color-p)', fontWeight: 'bold' }}>{toPercent(session.live_metrics.currentSuccessRate)}</span>
                                    </div>
                                    <button 
                                        onClick={() => downloadReport(session)}
                                        style={{ background: 'rgba(56, 189, 248, 0.15)', color: 'var(--color-l)', border: '1px solid var(--color-l)', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                    >
                                        ⬇️ 下载诊断报告
                                    </button>
                                </div>
                            </div>

                            {/* 对话轮次列表 */}
                            <div style={{ padding: '1rem 1.5rem' }}>
                                {session.messages && session.messages.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {session.messages.reduce((acc, msg, i, arr) => {
                                            if (msg.role === 'user') {
                                                const nextMsg = arr[i+1];
                                                const metrics = nextMsg?.metrics || {};
                                                const triggers = metrics.triggers || [];
                                                const analysis = metrics.analysis || '';
                                                acc.push(
                                                    <div key={msg.id} style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: '3px solid var(--color-l)' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                            <span style={{ color: 'var(--color-l)', fontSize: '0.8rem', fontWeight: 'bold' }}>第 {Math.floor(i/2) + 1} 轮 · 用户话术</span>
                                                            {triggers.length > 0 && (
                                                                <span style={{ color: '#fb7185', fontSize: '0.8rem', fontWeight: 'bold' }}>⚠️ 触发雷区</span>
                                                            )}
                                                        </div>
                                                        <div style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>
                                                            <strong style={{ opacity: 0.6 }}>你:</strong> "{msg.content}"
                                                        </div>
                                                        <div style={{ color: 'var(--text-secondary)', marginBottom: '12px', paddingLeft: '1rem', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                                                            <strong style={{ opacity: 0.6 }}>对象:</strong> "{nextMsg?.content || '...'}"
                                                        </div>
                                                        
                                                        {triggers.length > 0 && (
                                                            <div style={{ padding: '10px', background: 'rgba(244, 63, 94, 0.08)', borderRadius: '4px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                                                    {triggers.map((t, ti) => (
                                                                        <span key={ti} style={{ background: '#fb7185', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem' }}>{t}</span>
                                                                    ))}
                                                                </div>
                                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                                                                    <strong>诊断说明:</strong> {analysis || '暂无详细分析'}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }
                                            return acc;
                                        }, [])}
                                    </div>
                                ) : (
                                    <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>暂无对话明细</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    function downloadReport(session) {
        const title = `灵犀镜像 - 博弈诊断报告 [${currentPersona.name}]`;
        const time = new Date(session.created_at).toLocaleString();
        const metrics = `最终胜率: ${toPercent(session.live_metrics.currentSuccessRate)} | 情绪阻力: ${toPercent(session.live_metrics.emotionalResistance)}`;
        
        let content = `${title}\n`;
        content += `================================================\n`;
        content += `推演时间: ${time}\n`;
        content += `推演场景: ${session.scenario}\n`;
        content += `核心指标: ${metrics}\n`;
        content += `================================================\n\n`;

        session.messages.forEach((msg, i, arr) => {
            if (msg.role === 'user') {
                const turn = Math.floor(i/2) + 1;
                const nextMsg = arr[i+1];
                const metrics = nextMsg?.metrics || {};
                const triggers = metrics.triggers || [];
                const analysis = metrics.analysis || '';
                
                content += `[第 ${turn} 轮]\n`;
                content += `用户: ${msg.content}\n`;
                content += `对象: ${nextMsg?.content || '(未回复)'}\n`;
                
                if (triggers.length > 0) {
                    content += `⚠️ 触发雷区: ${triggers.join(', ')}\n`;
                    content += `💡 专家诊断: ${analysis}\n`;
                }
                content += `------------------------------------------------\n\n`;
            }
        });

        content += `\n总结建议:\n基于本次推演，建议减少触碰 "${data.recentTriggers.map(t => t.name).join(', ')}" 等敏感点。`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `MirrorLogic_Report_${currentPersona.name}_${new Date().getTime()}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    }
}
