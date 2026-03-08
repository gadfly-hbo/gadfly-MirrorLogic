const text = '( (冷笑冷笑) ) 你这种你这种挑衅挑衅毫无意义毫无意义。要么。要么拿出拿出能能让我动让我动心的方案心的方案，要么，要么滚蛋滚蛋。。';
const t2 = text.replace(/(.{1,8}?)\1+/g, '$1');
console.log('Test 1:', t2);

// Since some segments have punctuation like '要么。要么', 
// we should try a more generic approach:
const t3 = text.replace(/([^\w\s]{1,10})\1+/gu, '$1'); // doesn't match '要么' which has letters? wait, Chinese chars are not \w. So [^\x00-\xff] matches Chinese.
const t4 = text.replace(/([\s\S]{1,12}?)\1+/g, '$1');
console.log('Test 4:', t4);
