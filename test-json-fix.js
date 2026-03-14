// 模拟后端解析逻辑的黑盒测试 (同步最新 strategy.js 逻辑)
const parseRobustJson = (text) => {
    let jsonStr = text;
    try {
        // 1. 尝试直接解析
        return JSON.parse(text);
    } catch (e) {
        // 2. 尝试提取最外层 { }
        const match = text.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("无法在输出中找到 JSON 结构");
        
        jsonStr = match[0];
        
        // 3. 清理常见的 LLM JSON 格式错误
        jsonStr = jsonStr
            .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*/g, '$1') // 移除注释，但避开 URL 中的 //
            .replace(/,\s*([\}\]])/g, '$1') // 去除对象/数组末尾的冗余逗号
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // 移除非法控制字符
        
        try {
            return JSON.parse(jsonStr);
        } catch (e2) {
            // 4. 极端情况：处理内部未转义的换行
            const fixedJson = jsonStr.replace(/"([^"]*)"/g, (m, p1) => {
                return '"' + p1.replace(/\n/g, "\\n").replace(/\r/g, "\\r") + '"';
            });
            return JSON.parse(fixedJson);
        }
    }
};

const dirtyInputs = [
    {
        name: "Standard Markdown",
        text: "好的，这是结果：\n```json\n{\"A\": \"test\"}\n```\n希望满意。"
    },
    {
        name: "Trailing Comma",
        text: "{\"A\": \"test\", \"B\": [1, 2, ], }"
    },
    {
        name: "Embedded Comments",
        text: "{\n  \"A\": \"test\", // 这是一个注释\n  \"B\": \"value\" /* 块注释 */\n}"
    },
    {
        name: "Control Characters",
        text: "{\"A\": \"test\x00\x1F内容\"}"
    },
    {
        name: "Unescaped Newline",
        text: "{\n  \"A\": \"这是一段\n带有换行的文字\"\n}"
    }
];

console.log("=== 启动 JSON 鲁棒性验证测试 (Sync v2) ===");
dirtyInputs.forEach(input => {
    try {
        const result = parseRobustJson(input.text);
        console.log(`[PASS] ${input.name}:`, JSON.stringify(result));
    } catch (err) {
        console.error(`[FAIL] ${input.name}:`, err.message);
        console.log("Failed String:", input.text.substring(0, 100));
    }
});
console.log("=== 测试结束 ===");
