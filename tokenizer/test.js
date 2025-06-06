'use strict';

var Tokenizer = require('./index.js');

var tokenizer = new Tokenizer(['set', 'это', 'с', 'но'], ['дубликата', 'АЛЬТЕРНАТИВА', 'УРФУ', 'УРГУ', 'УПИ']);

var text = `
Альтернатива Set – это массивы с поиском дубликата при каждом добавлении, но они гораздо хуже по производительности.
Или можно использовать обычные объекты, где в качестве ключа выступает какой-нибудь уникальный идентификатор посетителя.
Но это менее удобно, чем простой и наглядный Set.
УРФУ
УРГУ
УПИ
`;

var tokens = tokenizer.tokenize(text);
console.log(tokens);
