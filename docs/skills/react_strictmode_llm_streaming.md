# Skill: React & LLM 流式输出（Streaming）状态管理规范

**用途**: 解决在 React 18 及其以上版本中，由于 `StrictMode` 导致组件进行二次渲染测试，从而引发 LLM 打字机效果出现“字符重复拼接、产生乱码和结巴”的恶性 Bug。此文档可作为后续所有 AI 产品接入流式对话的前端开发指引。

---

## 💥 痛点复盘：深渊级别的“重复结巴”现象

在 MirrorLogic v1.0 的【沙盘实战】模块开发中，当我们接入 DeepSeek 的流式 API（Server-Sent Events，SSE）时，前端聊天气泡频繁出现诸如“我我是是这么么想想的的”这种叠字乱码。排查过程中我们甚至一度怀疑是模型 API 或后端编码问题，多次更换了 Kimi 等不同模型，问题依旧残留。

**根本原因： React 的状态引用的违规变异（State Mutation）**

在原始代码中，我们将流式接收到的文本块（chunk）这样拼接：
```javascript
// 错误示范 ❌：直接顺藤摸瓜修改深层对象
setMessages(prev => {
    const newMsgs = [...prev];
    const lastMsg = newMsgs[newMsgs.length - 1]; 
    if (lastMsg && lastMsg.role === 'assistant') {
        lastMsg.content += chunk; // <-- 【致命错误】：修改了原有的 lastMsg 内存引用
    }
    return newMsgs;
});
```
在 React 18 的 StrictMode 下，为检测副作用，React 会在开发环境下故意**连续调用两次** `setState`。由于上述代码直接修改了 `lastMsg.content`，导致第一个（本该作废的）渲染周期拼进去的 `chunk` 被保存到了内存里，第二把正确执行时又拼了一次，最终导致所有新字都被重复渲染了两次。

---

## 🛠️ 标准解决架构：不可变数据规范（Immutable Update）

为了彻底杜绝此类 LLM 交互框架中的重叠文字问题，必须严守真正的**不可变数据原则**！我们要通过重构整个 `lastMsg` 对象，而不是只修改它内部的属性。

**正确架构指引：**
```javascript
// 正确示范 ✅：通过对象解构构建全新的引用
setMessages(prev => {
    const newMsgs = [...prev]; // 浅拷贝数组
    const lastMsg = newMsgs[newMsgs.length - 1]; // 拿到最后一个气泡对象

    if (lastMsg && lastMsg.role === 'assistant') {
        // 【核心解法】：用 ...lastMsg 解构生成一个全新的临时对象，切断和原 state 的内存联系
        newMsgs[newMsgs.length - 1] = {
            ...lastMsg, 
            content: lastMsg.content + chunk // 在新对象上进行字符累加
        };
    } else {
        // 如果最后一条不是 AI 说的话（比如那是刚发的一句提问），新建一条 assistant 回复
        newMsgs.push({ role: 'assistant', content: chunk });
    }
    return newMsgs;
});
```

---

## 📦 衍生法则：格式化清洗与流终止保护

在处理复杂流式大模型生成时（尤其是它在做内部推理时，可能会掺杂带有特定格式的思考标签，例如 Deepseek-R1 的思考残留或 \n 换行符），建议配合以下清洗机制：

1. **防御性去重（Deduplication）**：
   后端若已做了严格的处理，前端就不应该再画蛇添足地使用正则表达式去对拼装好的内容做暴力的过滤。
   
2. **终态信号标记（Done Flag）**：
   必须通过流断开（如 SSE 的 `[DONE]` 节点）来主动停止 `isTyping` 或 `isGenerating` 的前端状态绑定，否则会造成按钮持续处于被禁用的挂起状态：
   ```javascript
   if (line === '[DONE]') {
       setIsTyping(false); // 结束推演
       resolve();
       return;
   }
   ```

## 🚩 总结
在构建高并发的 AI 对话矩阵产品时，任何**闭包**与**状态更新**的边界都异常锐利。当出现奇怪的输入增生时，首要排查点应转移为：
**“我是否在 setState 中对某个嵌套对象使用了 `+=` 或 `.push()` 而没新建引用地址？”**
