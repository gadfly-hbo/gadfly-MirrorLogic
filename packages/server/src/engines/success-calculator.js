export function calculateTurnMetrics(persona, userMessage, aiResponse) {
    // 伪算法 (根据白皮书)
    // 分析用户消息是否契合 PLS
    let successDelta = 0;
    let emotionFriction = 0;
    const triggers = [];

    const text = userMessage.toLowerCase();

    // High P 权力
    if (persona.pls_p > 70) {
        if (text.includes('必须') || text.includes('应该') || text.includes('你要')) {
            emotionFriction += 0.3;
            successDelta -= 0.15;
            triggers.push('territory_defense');
        } else if (text.includes('建议') || text.includes('A还是B')) {
            successDelta += 0.1;
        }
    }

    // High L 逻辑
    if (persona.pls_l > 70) {
        if (text.includes('感觉') || text.includes('觉得') || text.includes('相信')) {
            emotionFriction += 0.2;
            successDelta -= 0.1;
            triggers.push('logic_bounce'); // 逻辑反弹
        } else if (text.match(/\d+/) || text.includes('数据') || text.includes('因为') || text.includes('所以')) {
            successDelta += 0.15;
        }
    }

    return {
        successDelta,
        emotionFriction,
        triggers
    };
}
