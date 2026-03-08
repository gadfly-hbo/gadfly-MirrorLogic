const text = '( (冷笑冷笑) ) 打架打架? RO? ROI是I是负的负的, 浪费时间, 浪费时间。要。要谈就谈就谈正谈正事。事。';

console.log("Original: " + text);

// Old regex
console.log("Old regex 2-12: " + text.replace(/(.{2,12}?)\1+/g, '$1'));

// New regex
console.log("New regex 1-15: " + text.replace(/(.{1,15}?)\1+/g, '$1'));

// With loops
function clean(t) {
    let r = t;
    let limit = 0;
    while (limit < 5) {
        let n = r.replace(/(.{1,15}?)\1+/g, '$1');
        if (n === r) break;
        r = n;
        limit++;
    }
    return r;
}
console.log("New regex looped: " + clean(text));
