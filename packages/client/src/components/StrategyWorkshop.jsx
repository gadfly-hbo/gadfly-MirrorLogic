import React, { useState, useEffect } from 'react';
import useStore from '../store';
import { apiUrl } from '../utils/api.js';

export default function StrategyWorkshop({ onBack }) {
    const { currentPersona } = useStore();
    const [frameworkData, setFrameworkData] = useState(null);
    const [rawInput, setRawInput] = useState('');
    const [scenario, setScenario] = useState('日常交锋/谈判');
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationResult, setTranslationResult] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        fetch(apiUrl(`/api/strategy/framework/${currentPersona.id}`))
            .then(res => res.json())
            .then(data => setFrameworkData(data))
            .catch(err => console.error(err));
    }, [currentPersona.id]);

    const handleTransform = async (e) => {
        e.preventDefault();
        if (!rawInput.trim()) return;

        setIsTranslating(true);
        setTranslationResult(null);

        try {
            const res = await fetch(apiUrl('/api/strategy/transform'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    personaId: currentPersona.id,
                    rawInput,
                    scenario
                })
            });

            const data = await res.json();
            if (res.ok) {
                setTranslationResult(data);
            } else {
                alert(data.error || '解析失败，请重试');
            }
        } catch (err) {
            console.error(err);
            alert('网络错误');
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column',
            ...(isExpanded ?
                { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'var(--bg-main)', padding: '20px', maxWidth: 'none', height: '100vh' } :
                { height: '80vh', maxWidth: '1000px', width: '100%' }),
            gap: '1rem'
        }}>

            {/* 头部：基础建议区 */}
            <div style={{ display: 'flex', gap: '1rem', flex: '0 0 auto' }}>
                <div style={{ flex: 1, padding: '1rem 1.5rem', background: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border-color)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setIsExpanded(!isExpanded)} style={{ background: 'transparent', color: 'var(--color-p)', border: '1px solid var(--color-p)', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px' }}>
                            {isExpanded ? '↙️ 还原窗口' : '↗️ 全屏放大'}
                        </button>
                        <button onClick={onBack} style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px' }}>
                            关闭工作台
                        </button>
                    </div>

                    <div style={{ marginBottom: '0.8rem' }}>
                        <h2 style={{ margin: '0 0 0.3rem 0', fontSize: '1.4rem' }}>💡 沟通策略与话术工作台 <span style={{ color: 'var(--color-p)', fontSize: '1.1rem', fontWeight: 'bold', marginLeft: '0.5rem', padding: '2px 8px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '4px' }}>针对: {currentPersona.name}</span></h2>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>用途：基于对方的核心性格（PLS指纹），为您量身定制沟通框架，并将您的“粗糙大白话”转化为高成功率的职场话术。</p>
                    </div>

                    {frameworkData ? (
                        <div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>推荐交锋框架:</span>
                                <span style={{ padding: '4px 12px', background: 'var(--color-p)', color: 'white', borderRadius: '4px', fontWeight: 'bold' }}>{frameworkData.framework}</span>
                                <span style={{ color: 'var(--text-secondary)', marginLeft: '1rem' }}>底层定调:</span>
                                <span style={{ color: 'white' }}>{frameworkData.toneAdvice}</span>
                            </div>

                            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>
                                {frameworkData.primaryTactics.map((tactic, i) => (
                                    <li key={i} style={{ marginBottom: '8px' }}>{tactic}</li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div style={{ color: 'var(--text-muted)' }}>加载战略框架中...</div>
                    )}
                </div>
            </div>

            {/* 下部：操作与输出区 */}
            <div style={{ display: 'flex', gap: '1.5rem', flex: 1, overflow: 'hidden' }}>

                {/* 左侧：我方原本的大白话输入框 */}
                <div style={{ flex: '0 0 40%', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card-hover)' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>第一步：输入诉求与底层原话</h3>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>输入你真实的沟通目的和你想说的"大白话"，引擎会结合 PLS 模型，生成防暴雷/高转化率的专项策略与定制话术。</p>
                    </div>

                    <form onSubmit={handleTransform} style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '1rem', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>所处高压场景</label>
                            <input
                                type="text"
                                value={scenario}
                                onChange={e => setScenario(e.target.value)}
                                placeholder="例如：周会汇报被怼、申请资源、挽留将离职核心骨干..."
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>你原本想说的话</label>
                            <textarea
                                value={rawInput}
                                onChange={e => setRawInput(e.target.value)}
                                placeholder="例如：我真的尽力了，这个项目本来就很难，现在时间不够我也没办法，你要么加人要么延期吧。"
                                style={{ flex: 1, width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', outline: 'none', boxSizing: 'border-box', resize: 'none', lineHeight: '1.5' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isTranslating || !rawInput.trim()}
                            style={{ width: '100%', padding: '12px', background: 'var(--color-l)', color: 'white', border: 'none', borderRadius: '4px', cursor: (isTranslating || !rawInput.trim()) ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                        >
                            {isTranslating ? '正在推演多种应对战略 (调用 LLM)...' : '生成 A/B/C 三轨战略话术'}
                        </button>
                    </form>
                </div>

                {/* 右侧：翻译与纠正输出区 */}
                <div style={{ flex: 1, padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border-color)', overflowY: 'auto' }}>
                    {!translationResult && !isTranslating && (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🤖</div>
                            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>等待引擎接收诉求</h3>
                            <p style={{ maxWidth: '300px', lineHeight: '1.5' }}>在左侧输入您遇到的沟通场景与打算说的原话。<br /><br />大模型将结合 {currentPersona.name} 的 PLS 性格指纹，即时演算出最适合的沟通策略，并给您 3 套立即可用的高情商话术。</p>
                        </div>
                    )}

                    {isTranslating && (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid var(--border-color)', borderTopColor: 'var(--color-p)', animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
                            <div style={{ color: 'var(--text-secondary)' }}>正在拦截致命雷点并格式化商业话术...</div>
                            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                        </div>
                    )}

                    {translationResult && !isTranslating && (
                        <div style={{ animation: 'fadeIn 0.5s' }}>
                            <h3 style={{ margin: '0 0 1rem 0', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>第二步：定制策略与话术生成输出</h3>

                            {translationResult.custom_framework && (
                                <div style={{ background: 'var(--bg-card-hover)', borderLeft: '4px solid var(--color-p)', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>🧠 场景专属解析与策略定调</h4>
                                    <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                        {translationResult.custom_framework}
                                    </div>
                                </div>
                            )}

                            {translationResult.key_flaws && translationResult.key_flaws.length > 0 && (
                                <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#fb7185' }}>⚠️ 原话致死雷点分析</h4>
                                    <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#fda4af', fontSize: '0.9rem' }}>
                                        {translationResult.key_flaws.map((flaw, i) => (
                                            <li key={i} style={{ marginBottom: '4px' }}>{flaw}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {['A', 'B', 'C'].map(key => {
                                    if (!translationResult[key]) return null;
                                    const item = translationResult[key];
                                    return (
                                        <div key={key} style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '1rem', position: 'relative', overflow: 'hidden' }}>
                                            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: key === 'A' ? 'var(--color-p)' : (key === 'B' ? 'var(--color-s)' : 'var(--color-l)') }} />
                                            <h4 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>
                                                方案 {key}: <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal', fontSize: '0.9rem' }}>{item.style}</span>
                                            </h4>
                                            <div style={{ color: 'var(--text-primary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                                "{item.script}"
                                            </div>
                                            <button
                                                onClick={() => { navigator.clipboard.writeText(item.script); alert('话术已复制！可以带往实战沙盘进行校验。'); }}
                                                style={{ marginTop: '0.8rem', background: 'transparent', color: 'var(--text-secondary)', border: '1px dashed var(--text-muted)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.8rem', cursor: 'pointer' }}
                                            >
                                                📋 复制话术去沙盘测试
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
