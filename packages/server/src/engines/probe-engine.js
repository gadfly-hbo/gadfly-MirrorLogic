export const PROBE_QUESTIONS = [
    {
        id: "q1",
        scenario: "当关键项目突发延期预警时，他的第一反应通常是：",
        options: [
            { text: "立刻追责：“是谁的问题？为什么现在才报？”", impact: { P: +15, L: -5, S: +5, E: -10 } },
            { text: "要解决方案：“别废话，给我三个补救方案及各自的成本。”", impact: { P: +5, L: +15, S: -5, E: -5 } },
            { text: "评估风险边界：“最坏情况会损失多少？有没有兜底的协议？”", impact: { P: 0, L: +5, S: +15, E: -5 } },
            { text: "安抚团队情绪：“大家先稳住，我们一起开个会看看怎么共渡难关。”", impact: { P: -10, L: -5, S: -5, E: +15 } }
        ]
    },
    {
        id: "q2",
        scenario: "在听取一个新的商业提案或创意时，最能打动他的是：",
        options: [
            { text: "明确的 ROI 数据测算、因果推导与竞争分析。", impact: { P: 0, L: +15, S: +5, E: -10 } },
            { text: "能让他获得极大的行业话语权、控制力或颠覆性地位。", impact: { P: +15, L: -5, S: -5, E: -5 } },
            { text: "这个行业已经有成功先例，且我们的试错成本被严格控制在极低水平。", impact: { P: 0, L: +5, S: +15, E: -10 } },
            { text: "能够带来巨大社会价值，或团队展现出极度热情和愿景的感染力。", impact: { P: -5, L: -10, S: -5, E: +15 } }
        ]
    },
    {
        id: "q3",
        scenario: "你需要在非工作时间给他发送一条重要汇报，他平时的回复习惯通常是：",
        options: [
            { text: "秒回简短指令：“可以”、“重做”、“来我办公室”。", impact: { P: +10, L: +5, S: -5, E: -10 } },
            { text: "长篇大论列出 1,2,3 条逻辑漏洞，要求你补充数据。", impact: { P: +5, L: +15, S: +5, E: -5 } },
            { text: "不直接拍板，而是问：“法务看过了吗？”或“A部门怎么说？”", impact: { P: -5, L: +5, S: +15, E: 0 } },
            { text: "先嘘寒问暖：“辛苦了，这么晚还在弄，不过这件事我们探讨一下...”", impact: { P: -5, L: -5, S: -5, E: +15 } }
        ]
    },
    {
        id: "q4",
        scenario: "当公司面临裁员或重大组织变革时，他最恐惧（或最想避免）的是：",
        options: [
            { text: "失去对核心局面的掌控，权威受到挑战。", impact: { P: +15, L: 0, S: -5, E: -10 } },
            { text: "过程混乱、没有章法，缺乏清晰的数据支撑和补偿逻辑。", impact: { P: 0, L: +15, S: +5, E: -5 } },
            { text: "引发劳动仲裁、公关危机，产生不可控的负面连锁反应。", impact: { P: 0, L: +5, S: +15, E: 0 } },
            { text: "被员工指责冷血无情，破坏了他苦心经营的“大家长”人设。", impact: { P: +5, L: -5, S: 0, E: +15 } }
        ]
    },
    {
        id: "q5",
        scenario: "在进行一项需要妥协的艰难谈判时，他倾向于：",
        options: [
            { text: "绝对不退让，通过施压甚至语言恐吓逼迫对方就范。", impact: { P: +15, L: -5, S: -10, E: -10 } },
            { text: "拿出精算的 Excel 模型，一条条证明为什么我方底线是合理的。", impact: { P: 0, L: +15, S: 0, E: -5 } },
            { text: "留出极大的安全边际，宁可谈判破裂也不接受任何隐性风险。", impact: { P: 0, L: +5, S: +15, E: 0 } },
            { text: "主打感情牌，用过往的合作情分或者描绘未来双赢来软化对方。", impact: { P: -10, L: -5, S: -5, E: +15 } }
        ]
    },
    {
        id: "q6",
        scenario: "在布置一项极其重要但边界模糊的创新任务时，他会如何交代？",
        options: [
            { text: "“我要的是结果，不管你用什么方法，周五之前放在我桌上，做不到就换人。”", impact: { P: +15, L: -5, S: -5, E: -10 } },
            { text: "“第一步你需要收集A数据，第二步验证B假设，然后给我看漏斗模型。”", impact: { P: +5, L: +15, S: +5, E: -5 } },
            { text: "“这个项目风险很大，你要每半天给我做一次进度同步，不要擅作主张。”", impact: { P: +10, L: 0, S: +15, E: -5 } },
            { text: "“我看好你的潜力，放手去干吧，遇到阻力随时找我，我是你坚强的后盾。”", impact: { P: -10, L: -5, S: -10, E: +15 } }
        ]
    }
];

export function calculatePLS(answers) {
    // 初始基准值 50
    let P = 50, L = 50, S = 50, E = 50;

    answers.forEach(ans => {
        const question = PROBE_QUESTIONS.find(q => q.id === ans.questionId);
        if (!question) return;
        const option = question.options[ans.optionIndex];
        if (!option) return;

        P += option.impact.P || 0;
        L += option.impact.L || 0;
        S += option.impact.S || 0;
        E += option.impact.E || 0;
    });

    // 约束在 0-100 范围内
    const clamp = (val) => Math.max(0, Math.min(100, val));

    return {
        P: clamp(P),
        L: clamp(L),
        S: clamp(S),
        E: clamp(E)
    };
}
