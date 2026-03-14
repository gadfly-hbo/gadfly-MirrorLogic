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
                <button onClick={onBack} style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', padding: '8px 16px' }}>关闭洞察面板</button>
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

                    <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-l)' }}>💡 教练点评 (AI 综合诊断)</h4>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                            根据你在近期沙盘中对 {currentPersona.name} 的表现分析，虽然你掌握了一定的沟通基础，但在面对高压质询时很容易暴露出逻辑准备不充分的问题，导致 **预估胜率在 {toPercent(data.averageSuccessRate)} 附近徘徊**。
                            建议回到 <strong onClick={onBack} style={{ color: 'white', cursor: 'pointer', textDecoration: 'underline' }}>策略工坊</strong>，多推演并采纳 "方案 C (结论先行)" 的话术结构，你的说服力将大幅提升。
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
