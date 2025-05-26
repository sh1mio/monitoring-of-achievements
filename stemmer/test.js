/**
 * \author Жаналиев Артур
 * \date 2016
 */

'use strict';

var Stemmer = require('./index.js').Stemmer;

var stemmer = new Stemmer();

var test_word = require('./test_word.js');
var test_stem = require('./test_stem.js');

var err_count = 0;
for (let i = 0; i < test_word.length; ++i) {
    let lexeme = stemmer.stem(test_word[i]);
    let lexeme2 = stemmer.stemAndFragment(test_word[i]);
    console.log(lexeme2);
    if (test_stem[i] === lexeme) {
        console.log('Success!', test_word[i], test_stem[i], lexeme);
    } else {
        console.log('Error!', test_word[i], test_stem[i], lexeme);
        err_count++;
    }
}
console.log('Error:', err_count);
