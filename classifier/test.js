'use strict';

var util = require('util');

var Classifier = require('./index.js');
var Tokenizer = require('./../tokenizer');

var tokenizer = new Tokenizer([], ['УрФУ']);
var classifier = new Classifier(tokenizer);

classifier.train('Уральский федеральный университет имени первого Президента России', 'УрФУ');
classifier.train('Уральский федеральный университет', 'УрФУ');
classifier.train('УрФУ', 'УрФУ');
classifier.train('Уральский государственный экономический университет', 'УрГЭУ');
classifier.train('УрГЭУ', 'УрГЭУ');
classifier.train('Мини-футбол', 'мини-футбол');

var text = `
УрГЭУ
УрГЭУ
УрГЭУ
УрГЭУ
УрГЭУ
УрГЭУ
УрГЭУ
Кто сыграет в финале Чемпионата России по гандболу Первой лиги В борьбе за финал гандбольный клуб УрФУ принимает на своем поле сильнейшие команды Москвы, Санкт-Петербурга и Стерлитамака В текущем сезоне УрФУ борется за попадание в финал чемпионата В текущем сезоне УрФУ борется за попадание в финал чемпионата В Екатеринбург съехались сильнейшие команды Москвы — «Ударник», Санкт-Петербурга — «Ленинградец» и Стерлитамака — «Монтаж», чтобы побороться за место в финале Чемпионата России по гандболу. Они сыграют с хозяевами площадки — командой УрФУ. Игры пройдут в Спортивном комплексе игровых видов спорта УрФУ (СКИВС, ул. Коминтерна, 14) с 7 по 14 февраля. «Мы усиленно тренируемся, чтобы не упасть в грязь лицом на домашнем туре. С 11 января первые две недели мы делали упор на физическую подготовку, потом работали с мячом, сейчас оттачиваем тактические моменты. Настрой как всегда боевой, надеемся добиться максимального результата, но волнение тоже есть, все-таки хочется порадовать своих болельщиков победами», — рассказал спортсмен гандбольного клуба УрФУ Юрий Козюберда. Также он добавил, что в текущем сезоне УрФУ борется за попадание в финал чемпионата, после первого тура результат стопроцентный – две победы в двух играх. Расписание игр: 7 февраля 16:00 — УрФУ (Екатеринбург) — «Ленинградец» (Санкт-Петербург) 12 февраля 19:00 — УрФУ (Екатеринбург) — «Монтаж» (Стерлитамак) 13 февраля 19:00 — «Монтаж» (Стерлитамак) — «Ударник» (Москва) 14 февраля 10:30 — УрФУ (Екатеринбург) — «Ударник» (Москва)
УрГЭУ футбол мини-футбол футбол
`;

var category = classifier.classify(text);
console.log(category);
