const text = '（冷笑一声 （冷笑一声 ））你你是是在在命命令令我我？？我我不不接接受受任任何何形形式式的的挑衅。挑衅。';

function cleanStutter(input) {
    let result = input.trim();
    // 循环处理，直到不再有任何这种短词/短句结巴，1-15字长度跨度
    let limit = 0;
    while (limit < 5) {
        let next = result.replace(/(.{1,15}?)\1+/g, '$1');
        if (next === result) break;
        result = next;
        limit++;
    }
    // 修复连着出现的中文及英文标点
    result = result.replace(/([。！？，、；：.,!?])\1+/g, '$1');
    return result;
}

console.log("Original: " + text);
console.log("Cleaned:  " + cleanStutter(text));
