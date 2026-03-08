import React, { useState, useEffect } from 'react';
import useStore from '../store';
import { apiUrl } from '../utils/api.js';

export default function Probe({ onComplete, onCancel }) {
    const [questions, setQuestions] = useState([]);
    const [currentStep, setCurrentStep] = useState(-1); // -1 = setup, 0 to N = questions, N+1 = loading
    const [formData, setFormData] = useState({ name: '', relationship: '' });
    const [answers, setAnswers] = useState([]);
    const { setCurrentPersona, fetchPersonas } = useStore();

    useEffect(() => {
        fetch(apiUrl('/api/probe/questions'))
            .then(res => res.json())
            .then(data => setQuestions(data))
            .catch(err => console.error("加载探针失败", err));
    }, []);

    const handleStart = (e) => {
        e.preventDefault();
        if (formData.name.trim() === '') return;
        setCurrentStep(0);
    };

    const handleAnswer = (optionIndex) => {
        const qId = questions[currentStep].id;
        const newAnswers = [...answers, { questionId: qId, optionIndex }];
        setAnswers(newAnswers);

        if (currentStep + 1 < questions.length) {
            setCurrentStep(currentStep + 1);
        } else {
            submitProbe(newAnswers);
        }
    };

    const submitProbe = async (finalAnswers) => {
        setCurrentStep(questions.length); // loading state
        try {
            const res = await fetch(apiUrl('/api/probe/analyze'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answers: finalAnswers,
                    personaName: formData.name,
                    relationship: formData.relationship
                })
            });
            const data = await res.json();
            setCurrentPersona(data);
            await fetchPersonas();
            onComplete(); // Go back to Home and user can click Sandbox
        } catch (err) {
            console.error(err);
            onCancel();
        }
    };

    if (questions.length === 0) {
        return <div className="welcome-card" style={{ maxWidth: '600px', width: '100%' }}>正在加载探针模块...</div>;
    }

    return (
        <div className="welcome-card" style={{ maxWidth: '700px', width: '100%', position: 'relative' }}>
            <button
                onClick={onCancel}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
                ✕
            </button>

            {currentStep === -1 && (
                <div style={{ textAlign: 'left', animation: 'fadeIn 0.5s' }}>
                    <h2 style={{ marginTop: 0 }}>行为特征测写问卷 (保护隐私模式)</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        全程纯本地计算，您无需上传任何真实聊天记录，只需凭记忆回答该对象的常见行为习惯，即可进行高精度 PLS 倒推测写。
                    </p>
                    <form onSubmit={handleStart} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>目标名称或代号 *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="例如：张总，风险投资人 Lee"
                                style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', outline: 'none', boxSizing: 'border-box' }}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>你的角色 / 你们的关系</label>
                            <input
                                type="text"
                                value={formData.relationship}
                                onChange={e => setFormData({ ...formData, relationship: e.target.value })}
                                placeholder="例如：下属，项目合作方"
                                style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>
                        <button type="submit" style={{ padding: '12px', background: 'var(--color-p)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1.1rem', cursor: 'pointer', marginTop: '1rem', fontWeight: 'bold' }}>
                            开始测写问卷 ➔
                        </button>
                    </form>
                </div>
            )}

            {currentStep >= 0 && currentStep < questions.length && (
                <div style={{ textAlign: 'left', animation: 'fadeIn 0.3s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <span>探针扫描进度</span>
                        <span>{currentStep + 1} / {questions.length}</span>
                    </div>
                    <div style={{ height: '4px', background: 'var(--bg-main)', borderRadius: '2px', marginBottom: '2rem', overflow: 'hidden' }}>
                        <div style={{ width: `${((currentStep) / questions.length) * 100}%`, height: '100%', background: 'var(--color-p)', transition: 'width 0.3s ease' }} />
                    </div>

                    <h3 style={{ marginBottom: '2rem', lineHeight: '1.5' }}>{questions[currentStep].scenario}</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {questions[currentStep].options.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                style={{
                                    padding: '16px',
                                    textAlign: 'left',
                                    background: 'var(--bg-card-hover)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '4px',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                    lineHeight: '1.5'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                            >
                                {opt.text}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {currentStep === questions.length && (
                <div style={{ textAlign: 'center', padding: '3rem 0', animation: 'pulse 1.5s infinite' }}>
                    <h2 style={{ margin: 0, color: 'var(--color-p)' }}>正在解算 PLS 核心逻辑...</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>正在与行业矩阵基准对齐并生成多维特征画像</p>
                </div>
            )}

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
        </div>
    );
}
