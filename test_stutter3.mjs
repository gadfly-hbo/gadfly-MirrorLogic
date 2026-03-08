const text = '( (冷笑冷笑) ) 打架打架? RO? ROI是I是负的负的, 浪费时间, 浪费时间。要。要谈就谈就谈正谈正事。事。';

function cleanStutter(input) {
    let result = input;
    result = result.replace(/(.{1,15}?)\1+/g, '$1');
    return result;
}

console.log(cleanStutter(text));
