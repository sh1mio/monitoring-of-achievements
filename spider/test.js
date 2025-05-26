'use strict';

var Spider = require('./index.js');

var paths = [
    'http://urfu.ru/ru/news/',
    'http://www.msu.ru/news/',
    'https://lenta.ru/',
    'http://eburg.mk.ru/',
    'http://ria.ru/',
    'http://www.vesti.ru/'
];

var spider = new Spider(paths);

spider.init(function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log('init success');
        spider.scan();
    }
});
