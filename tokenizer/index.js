'use strict';

var Stemmer = require('./../stemmer').Stemmer;
var stemmer = new Stemmer();

/**
 * @constructor
 * @param {String[]} stopList список слов, для которых не будут создаваться токены
 * @param {String[]} exceptionStem список слов, которые не надо подвергать стеммингу
 */
function Tokenizer(stopList, exceptionStem)
{
    this.stopList = new Set();

    for (let i = 0; i < stopList.length; ++i) {
        this.stopList.add(stopList[i].toLowerCase());
    }

    this.exceptionStem = new Set();

    for (let i = 0; i < exceptionStem.length; ++i) {
        this.exceptionStem.add(exceptionStem[i].toLowerCase());
    }

    this.regToken = new RegExp("([\u0410-\u044f\u0401\u0451]+)|([a-zA-Z]+)|([0-9]+)", "g");
}

/**
 * @param {string} text
 * @return {string[]} массив токенов
 */
Tokenizer.prototype.tokenize = function(text) {
    let tokens = text.match(this.regToken);

    if (!tokens) {
        return [];
    }

    let outTokens = [];
    let lexeme;

    for (let i = 0; i < tokens.length; ++i) {
        lexeme = tokens[i].toLowerCase();

        if (this.stopList.has(lexeme) === false) {
            if (this.exceptionStem.has(lexeme) === false) {
                lexeme = stemmer.stem(lexeme);
            }

            if (lexeme && ((typeof lexeme) == 'string')) {
                outTokens.push(lexeme);
            }
        }
    }

    return outTokens;
};

module.exports = Tokenizer;
