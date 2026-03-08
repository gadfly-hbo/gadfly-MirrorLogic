import React, { useEffect, useState } from 'react';
import useStore from '../store';
import { apiUrl } from '../utils/api.js';

export default function PersonaList() {
    const { personas, isLoading, error, fetchPersonas, setCurrentPersona } = useStore();

    useEffect(() => {
        fetchPersonas();
    }, [fetchPersonas]);

    const handleCreateMock = async () => {
        try {
            await fetch(apiUrl('/api/personas/random'), {
                method: 'POST'
            });
            fetchPersonas();
        } catch (err) {
            console.error('创建失败:', err);
        }
    };

    const handleLoadBenchmarks = async () => {
        try {
            await fetch(apiUrl('/api/benchmarks/load'));
            fetchPersonas();
        } catch (err) {
            console.error('载入基准库失败:', err);
        }
    };

    const [collapsedGroups, setCollapsedGroups] = useState({});

    if (isLoading) return <p>加载中...</p>;
    if (error) return <p style={{ color: 'red' }}>错误: {error}</p>;

    const toggleGroup = (groupName) => {
        setCollapsedGroups(prev => ({
            ...prev,
            [groupName]: !prev[groupName]
        }));
    };

    const groups = {
        '今日 (24小时内)': [],
        '1 - 3天前': [],
        '3 - 7天前': [],
        '更早': []
    };

    const sortedPersonas = [...personas].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA; // Descending (newest first)
    });

    const now = new Date();
    sortedPersonas.forEach(p => {
        if (!p.createdAt) {
            groups['更早'].push(p);
            return;
        }
        const created = new Date(p.createdAt);
        const diffDays = (now - created) / (1000 * 60 * 60 * 24);

        if (diffDays <= 1) {
            groups['今日 (24小时内)'].push(p);
        } else if (diffDays <= 3) {
            groups['1 - 3天前'].push(p);
        } else if (diffDays <= 7) {
            groups['3 - 7天前'].push(p);
        } else {
            groups['更早'].push(p);
        }
    });

    return (
        <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <button onClick={handleCreateMock} style={{ padding: '0.5rem 1rem', background: 'var(--color-p)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    + 随机生成测试镜像
                </button>
                <button onClick={handleLoadBenchmarks} style={{ padding: '0.5rem 1rem', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}>
                    📚 载入行业基准库
                </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {Object.entries(groups).filter(([_, groupPersonas]) => groupPersonas.length > 0).map(([groupName, groupPersonas]) => {
                    const isCollapsed = collapsedGroups[groupName];
                    return (
                        <div key={groupName}>
                            <div
                                onClick={() => toggleGroup(groupName)}
                                style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem', color: 'var(--text-secondary)', transition: 'color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                                <span style={{ fontWeight: 'bold' }}>{groupName} <span style={{ fontSize: '0.85rem', opacity: 0.6, fontWeight: 'normal', marginLeft: '0.5rem' }}>({groupPersonas.length})</span></span>
                                <span>{isCollapsed ? '▼' : '▲'}</span>
                            </div>

                            {!isCollapsed && (
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {groupPersonas.map(p => (
                                        <div key={p.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-card-hover)', cursor: 'pointer', transition: 'border-color 0.2s' }} onClick={() => setCurrentPersona(p)} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-p)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{p.name}</h4>
                                                {p.tags && p.tags.length > 0 && (
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        {p.tags.map(tag => (
                                                            <span key={tag} style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', color: 'var(--text-secondary)' }}>{tag}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {p.description && (
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem 0', lineHeight: 1.4 }}>{p.description}</p>
                                            )}
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)', borderTop: p.description ? '1px solid var(--border-color)' : 'none', paddingTop: p.description ? '0.5rem' : 0 }}>
                                                <span style={{ color: p.pls_p > 70 ? 'var(--color-p)' : 'inherit' }}>P: {p.pls_p}</span>
                                                <span style={{ color: p.pls_l > 70 ? 'var(--color-l)' : 'inherit' }}>L: {p.pls_l}</span>
                                                <span style={{ color: p.pls_s > 70 ? 'var(--color-s)' : 'inherit' }}>S: {p.pls_s}</span>
                                                <span style={{ color: p.pls_e > 70 ? 'var(--color-e)' : 'inherit' }}>E: {p.pls_e}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
