import React, { useState } from 'react';
import PersonaList from './components/PersonaList';
import SandboxChat from './components/SandboxChat';
import Probe from './components/Probe';
import StrategyWorkshop from './components/StrategyWorkshop';
import InsightsDashboard from './components/InsightsDashboard';
import DataCapture from './components/DataCapture';
import useStore from './store';

function App() {
    const { currentPersona, setCurrentPersona } = useStore();
    const [currentView, setCurrentView] = useState('home'); // 'home', 'sandbox', 'probe', 'strategy', 'insights', 'capture'

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>灵犀镜像 MirrorLogic</h1>
                <p>基于 PLS 引擎的 AI 沟通与博弈全真模拟器</p>
            </header>
            <main className="app-main">
                {currentView === 'probe' && (
                    <Probe
                        onComplete={() => setCurrentView('home')}
                        onCancel={() => setCurrentView('home')}
                    />
                )}

                {currentView === 'capture' && (
                    <DataCapture
                        onComplete={() => setCurrentView('home')}
                        onCancel={() => setCurrentView('home')}
                    />
                )}

                {currentView !== 'probe' && currentView !== 'capture' && currentPersona && currentView === 'strategy' && (
                    <StrategyWorkshop onBack={() => setCurrentView('home')} />
                )}

                {currentView !== 'probe' && currentView !== 'capture' && currentPersona && currentView === 'insights' && (
                    <InsightsDashboard onBack={() => setCurrentView('home')} />
                )}

                {currentView !== 'probe' && currentView !== 'capture' && currentPersona && currentView === 'sandbox' && (
                    <SandboxChat onExit={() => setCurrentView('home')} />
                )}

                {currentView !== 'probe' && currentView !== 'capture' && currentPersona && currentView === 'home' && (
                    <div className="welcome-card" style={{ maxWidth: '600px', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ margin: 0 }}>当前镜像: {currentPersona.name}</h2>
                            <button onClick={() => setCurrentPersona(null)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>返回镜像库</button>
                        </div>

                        <div style={{ background: 'var(--bg-card-hover)', padding: '1rem', borderRadius: '4px', textAlign: 'left', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ color: 'var(--color-p)', marginTop: 0 }}>P (Power) / 权力意志: {currentPersona.pls_p}</h4>
                            <h4 style={{ color: 'var(--color-l)' }}>L (Logic) / 逻辑权重: {currentPersona.pls_l}</h4>
                            <h4 style={{ color: 'var(--color-s)' }}>S (Stability) / 安全冗余: {currentPersona.pls_s}</h4>
                            <h4 style={{ color: 'var(--color-e)', marginBottom: 0 }}>E (Empathy) / 共情开合: {currentPersona.pls_e}</h4>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexDirection: 'column' }}>
                            <button onClick={() => setCurrentView('sandbox')} style={{ width: '100%', padding: '1rem', background: 'var(--color-p)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold' }}>
                                ⚔️ 进入博弈沙盘
                            </button>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setCurrentView('strategy')} style={{ flex: 1, padding: '1rem', background: 'var(--bg-card-hover)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>
                                    💡 策略工坊
                                </button>
                                <button onClick={() => setCurrentView('insights')} style={{ flex: 1, padding: '1rem', background: 'var(--bg-card-hover)', color: 'var(--color-p)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>
                                    📊 数据洞察面板
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {currentView === 'home' && !currentPersona && (
                    <div className="welcome-card" style={{ maxWidth: '600px', width: '100%' }}>
                        <h2 style={{ marginBottom: '0.5rem' }}>欢迎来到 PLS 战略核心</h2>
                        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>请选择或创建一个数字孪生体以开始推演</p>

                        <h4 style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>🎯 定向精准构建 (热启动)</h4>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                            <button
                                onClick={() => setCurrentView('probe')}
                                style={{ flex: 1, padding: '1rem', background: 'var(--color-p)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1.05rem' }}>📝 行为问卷测写</span>
                                <span style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 'normal' }}>(保护隐私 / 免上传)</span>
                            </button>
                            <button
                                onClick={() => setCurrentView('capture')}
                                style={{ flex: 1, padding: '1rem', background: 'var(--color-l)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1.05rem' }}>📄 文本逆向剖析</span>
                                <span style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 'normal' }}>(提供历史言论)</span>
                            </button>
                        </div>

                        <h4 style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>🗄️ 系统与预设库 (冷启动)</h4>

                        <PersonaList />
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
