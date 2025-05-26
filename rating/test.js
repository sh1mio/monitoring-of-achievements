'use strict';

const Rating = require('./index.js');

var rating = new Rating();

rating.init(function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log('init success');
        rating.scan();
    }
})
