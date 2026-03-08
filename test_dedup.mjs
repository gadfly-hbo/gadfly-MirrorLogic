function deduplicateText(text) {
    // 第0层：修复开头结巴："我不我不" → "我不"
    let result = text.replace(/(.{2,8})\1+/g, '$1');

    // 第1层：整文本重复检测
    const len = result.length;
    for (let halfLen = Math.floor(len * 0.3); halfLen <= Math.floor(len * 0.6); halfLen++) {
        const prefix = result.slice(0, halfLen);
        const rest = result.slice(halfLen);
        if (rest.startsWith(prefix.slice(0, Math.floor(prefix.length * 0.8)))) {
            result = prefix;
            break;
        }
    }

    // 第2层：句子级精确去重（只去完全相同的句子）
    const sentences = result.split(/(?<=[。！？\.!\?])/g).map(s => s.trim()).filter(s => s.length > 0);
    const seen = new Set();
    const unique = [];
    for (const s of sentences) {
        if (!seen.has(s)) {
            seen.add(s);
            unique.push(s);
        }
    }
    return unique.join('');
}

const tests = [
    '我不是来玩游戏的，我们来谈正事。请直接说重点。我不是来玩游戏的，我们来谈正事。请直接说重点。',
    '你的你的疲劳不是我的问题。但是，效率和长期产出对我来说很重要。疲劳不是我的问题。但是，效率和长期产出对我来说很重要。',
    '了解了解你的状况，但项目关键阶段需要每个人的全力投入。了解你的状况，但项目关键阶段需要每个人的全力投入。别让团队受损失。',
    'Test sentence A. Test sentence B. Test sentence A. Test sentence B.',
    '好的，我理解你的诉求。但是时间不等人。',
];

tests.forEach((t, i) => {
    console.log(`--- Test ${i + 1} ---`);
    console.log(`IN:  ${t}`);
    console.log(`OUT: ${deduplicateText(t)}`);
    console.log();
});
