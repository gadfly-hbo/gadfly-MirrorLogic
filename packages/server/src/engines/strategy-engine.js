export function getStrategyFramework(persona) {
    const { pls_p, pls_l, pls_s, pls_e } = persona;

    let framework = 'STAR 情景对话';
    let primaryTactics = [];
    let toneAdvice = '';

    // 高 P / 高 L (例如：强势、数据导向的老板/客户)
    if (pls_p >= 70 && pls_l >= 70) {
        framework = 'FBI 极限谈判 + 金字塔原理';
        primaryTactics = [
            '结论先行：前 3 秒给出核心诉求或结论',
            '选择题法则：只给 2-3 个精心包装的选项，绝不给开放性问题',
            '利益捆绑：明确将诉求与对方的核心 KPI（ROI、成本）挂钩'
        ];
        toneAdvice = '精练、果断、不卑不亢、用数据说话';
    }
    // 高 P / 低 L (例如：集权、易受直觉/情绪影响的领导者)
    else if (pls_p >= 70 && pls_l < 50) {
        framework = '权力让渡术 + 愿景锚定';
        primaryTactics = [
            '假性请教：用“向您请教”代替“向您汇报”，降低由于防御带来的对抗',
            '愿景描绘：跳出琐碎的数字，把提议包装成能提升他在组织内分量或名声的宏大叙事',
            '保全颜面：即便是纠正他的错误，也必须私下进行，且归咎于外部因素'
        ];
        toneAdvice = '极其尊重、充满激情、引导式提问';
    }
    // 高 S (例如：极度保守、风险厌恶的合作方)
    else if (pls_s >= 70) {
        framework = '风险对冲框架 + 黑天鹅防线';
        primaryTactics = [
            '底线兜底：不要急于谈收益，先花 80% 篇幅谈如果失败对方的损失上限是多少（且明确这能承受）',
            '三步退路：准备好随时叫停项目的止损点，给他随时反悔的安全感',
            '社会证明：大量列举同行业的成功案例（非第一只吃螃蟹的人）'
        ];
        toneAdvice = '稳健、详实、充满缓冲垫的话术';
    }
    // 高 E / 低 L (例如：感性、情绪内核的主管或伴侣)
    else if (pls_e >= 70 && pls_l < 50) {
        framework = '非暴力沟通 (NVC) + 共情回路';
        primaryTactics = [
            '情绪前置：先识别并确认对方当前的情绪状态（我知道你最近压力很大...）',
            '感受表达：多用“我的感受是...”代替“我认为你的做法不对...”',
            '价值共鸣：强调这件事对我们共同关系的维护或者带来的正面心理价值'
        ];
        toneAdvice = '温和、体贴、缓慢的语速、高频率反馈';
    }
    // 综合兜底层
    else {
        framework = '合作型探寻框架 (SPIN)';
        primaryTactics = [
            '背景探寻 (S)：了解现状',
            '难点聚焦 (P)：明确痛点',
            '暗示干预 (I)：放大不解决问题的后果',
            '需求确认 (N)：邀请对方一起想出路'
        ];
        toneAdvice = '专业、中立、探究式';
    }

    return { framework, primaryTactics, toneAdvice };
}
