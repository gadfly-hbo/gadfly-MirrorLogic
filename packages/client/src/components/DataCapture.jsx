import React, { useState } from 'react';
import useStore from '../store';
import { apiUrl } from '../utils/api.js';

export default function DataCapture({ onComplete, onCancel }) {
    const [text, setText] = useState('');
    const [name, setName] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const { setCurrentPersona } = useStore();

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!text.trim() || text.length < 10) {
            alert('文本过短，难以提取有效人格指纹');
            return;
        }

        setIsAnalyzing(true);
        try {
            const res = await fetch(apiUrl('/api/capture/analyze'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, name })
            });
            const result = await res.json();

            if (res.ok) {
                setCurrentPersona(result);
                onComplete();
            } else {
                alert(result.error || '分析失败');
            }
        } catch (err) {
            alert('网络无响应');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="welcome-card" style={{ maxWidth: '800px', width: '100%', textAlign: 'left', padding: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', marginTop: 0 }}>文本逆向剖析 (提供历史言论) (热启动)</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                请放心，分析将在纯本地或私密通道中完成。只需输入对方过往的微信截图文字、会议纪要等原始语料...、邮件或会议纪要。系统将以顶级行为心理学家视角，为您倒演出其 PLS 四维防御参数。
            </p>

            <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>为该数字孪生体命名 (选填)</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="例如：冷酷的前端主程 / 要求苛刻的甲方"
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', boxSizing: 'border-box' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>过往历史发言文本 (至少 20 词)</label>
                    <textarea
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="粘贴对方说过的具有代表性的话，或者他的长篇邮件、群聊发言..."
                        style={{ width: '100%', height: '150px', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', resize: 'vertical', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" onClick={onCancel} style={{ flex: 1, padding: '1rem', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}>
                        取消
                    </button>
                    <button type="submit" disabled={isAnalyzing} style={{ flex: 2, padding: '1rem', background: 'var(--color-l)', color: 'white', border: 'none', borderRadius: '4px', cursor: isAnalyzing ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                        {isAnalyzing ? '正在进行语义指纹提取...' : '开始文本深度剖析'}
                    </button>
                </div>
            </form>
        </div>
    );
}
