'use strict';

var Spider = require('./spider');
var Rating = require('./rating');

var paths = [
    'https://urfu.ru/ru/news/',
    'https://urfu.ru/get-news/ru/news/?cols=3&pid=53%2C11367%2C30302&categories=1%2C10%2C12%2C130%2C155%2C2%2C212%2C232%2C264%2C27%2C277%2C3%2C33%2C4%2C5%2C52%2C6%2C7%2C8%2C9%2C90%2C93%2C96&fullmode=1&offset=100&rows=1&selected=0&page=54&show_categories=1',
    //'https://www.msu.ru/news/',
    //'https://www.bmstu.ru/mstu/info/events/',
    //'https://www.bmstu.ru/mstu/info/bauman-news/',
    //'https://spbu.ru/news-spsu',
    //'https://mipt.ru/news/',
    //'https://www.hse.ru/news/',
    //'https://mpei.ru/news',
    //'https://mpei.ru/news/Pages/default.aspx',
    //'https://mephi.ru/content/news/',
    //'https://lenta.ru/',
    //'https://eburg.mk.ru/',
    //'https://ria.ru/',
    //'https://www.vesti.ru/'
];

var spider = new Spider(paths);
var rating = new Rating();

spider.init(function(err) {
    if (err) {
        console.log('spider err', err);
    } else {
        rating.init(function(err) {
            if (err) {
                console.log('rating err', err);
            } else {
                console.log('init success');
                spider.scan();
                rating.scan();
            }
        });
    }
});
