/**
 * \author Жаналиев Артур
 * \date 2016
 */

'use strict';

// Стеммер Портера для русского языка
// Сначала введем некоторые определения:
// Гласные буквы – а, е, и, о, у, ы, э, ю, я.
//      Буква ё считается равнозначной букве е.
// RV – область слова после первой гласной.
//      Она может быть пустой, если гласные в слове отсутствуют.
// R1 – область слова после первого сочетания “гласная-согласная”.
// R2 – область R1 после первого сочетания “гласная-согласная”.

/**
 * \class Stemmer
 * Стеммер.
 */
function Stemmer()
{
    this.vowel = "[аеиоуыэюя]"; // гласные буквы
    this.non_vowel = "[^аеиоуыэюя]"; // согласные буквы

    this.re_rv = new RegExp(this.vowel);
    this.re_r1 = new RegExp(this.vowel + this.non_vowel);

    // PERFECTIVE GERUND
    // Группа 1: в, вши, вшись.
    // Группа 2: ив, ивши, ившись, ыв, ывши, ывшись.
    // Окончаниям из группы 1 должна предшествовать буква а или я.
    this.re_perfective_gerund1 = new RegExp(
        "(([ая])(в|вши|вшись))$"
    );
    this.re_perfective_gerund2 = new RegExp(
        "(ив|ивши|ившись|ыв|ывши|ывшись)$"
    );

    // REFLEXIVE
    // ся, сь.
    this.re_reflexive = new RegExp("(ся|сь)$");

    // ADJECTIVAL
    // ADJECTIVAL определяется как ADJECTIVE или PARTICIPLE + ADJECTIVE.
    //      Например: бегавшая = бега + вш + ая.

    // ADJECTIVE
    // ее, ие, ые, ое, ими, ыми, ей, ий, ый, ой, ем, им, ым, ом,
    // его, ого, ему, ому, их, ых, ую, юю, ая, яя, ою, ею.
    this.re_adjective = new RegExp(
        "(ее|ие|ые|ое|ими|ыми|ей|ий|ый|ой|" +
        "ем|им|ым|ом|его|ого|ему|ому|их|ых|" +
        "ую|юю|ая|яя|ою|ею)$"
    );

    // PARTICIPLE
    // Группа 1: ем, нн, вш, ющ, щ.
    // Группа 2: ивш, ывш, ующ.
    // Окончаниям из группы 1 должна предшествовать буква а или я.
    this.re_participle1 = new RegExp(
        "(([ая])(ем|нн|вш|ющ|щ))$"
    );
    this.re_participle2 = new RegExp("(ивш|ывш|ующ)$");

    // VERB
    // Группа 1: ла, на, ете, йте, ли, й, л, ем, н,
    //      ло, но, ет, ют, ны, ть, ешь, нно.
    // Группа 2: ила, ыла, ена, ейте, уйте, ите, или, ыли,
    //      ей, уй, ил, ыл, им, ым, ен, ило, ыло, ено, ят, ует,
    //      уют, ит, ыт, ены, ить, ыть, ишь, ую, ю.
    // Окончаниям из группы 1 должна предшествовать буква а или я.
    this.re_verb1 = new RegExp(
        "(([ая])(ла|на|ете|йте|ли|й|л|" +
        "ем|н|ло|но|ет|ют|ны|ть|ешь|нно))$"
    );
    this.re_verb2 = new RegExp(
        "(ила|ыла|ена|ейте|уйте|ите|"+
        "или|ыли|ей|уй|ил|ыл|им|ым|ен|ило|" +
        "ыло|ено|ят|ует|уют|ит|ыт|ены|ить|ыть|ишь|ую|ю)$"
    );

    // NOUN
    // а, ев, ов, ие, ье, е, иями, ями, ами, еи, ии, и, ией, ей, ой,
    // ий, й, иям, ям, ием, ем, ам, ом, о, у, ах, иях, ях, ы, ь,
    // ию, ью, ю, ия, ья, я.
    this.re_noun = new RegExp(
        "(а|ев|ов|ие|ье|е|иями|ями|ами|еи|ии|и|" +
        "ией|ей|ой|ий|й|иям|ям|ием|ем|" +
        "ам|ом|о|у|ах|иях|ях|ы|ь|ию|ью|ю|ия|ья|я)$"
    );

    this.re_i = new RegExp("и$");

    // DERIVATIONAL
    // ост, ость.
    this.re_derivational = new RegExp("(ост|ость)$");

    // SUPERLATIVE:
    // ейш, ейше.
    this.re_superlative = new RegExp("(ейш|ейше)$");

    this.re_nn = new RegExp("(нн)$");

    this.re = new RegExp("ь$");
}

// Правила
// При поиске окончания из всех возможных выбирается наиболее длинное.
//      Например, в слове величие выбираем окончание ие, а не е.
// Все проверки производятся над областью RV. Так, при проверке
//      на PERFECTIVE GERUND предшествующие буквы а и я также
//      должны быть внутри RV. Буквы перед RV не участвуют
//      в проверках вообще.
Stemmer.prototype.stem = function(word) {
    if (word === '') {
        return '';
    }

    let rv_pos = this.find_rv(word);
    let r2_pos = this.find_r2(word);

    word = this.step_1(word, rv_pos);
    word = this.step_2(word, rv_pos);
    word = this.step_3(word, r2_pos);
    word = this.step_4(word, rv_pos);
    return word;
};

Stemmer.prototype.stemAndFragment = function(word) {
    let lexeme = this.stem(word);
    let beg = lexeme.length;
    return {
        "stem": lexeme,
        "fragment": word.substr(beg)
    };
};

// RV – область слова после первой гласной.
// Она может быть пустой, если гласные в слове отсутствуют.
Stemmer.prototype.find_rv = function(word) {
    let rv_match = this.re_rv.exec(word);
    if (rv_match === null) {
        return word.length;
    }
    return rv_match.index + rv_match[0].length;
};

// R1 – область слова после первого сочетания “гласная-согласная”.
Stemmer.prototype.find_r1 = function(word) {
    let r1_match = this.re_r1.exec(word);
    if (r1_match === null) {
        return word.length;
    }
    return r1_match.index + r1_match[0].length;
};

// R2 – область R1 после первого сочетания “гласная-согласная”.
Stemmer.prototype.find_r2 = function(word) {
    let r1_match = this.find_r1(word);
    let r2_match = this.re_r1.exec(word.substr(r1_match));
    if (r2_match === null) {
        return word.length;
    }
    return r1_match + r2_match.index + r2_match[0].length;
};

// Шаг 1
// Найти окончание PERFECTIVE GERUND.
// Если оно существует – удалить его и завершить этот шаг.
// Иначе, удаляем окончание REFLEXIVE (если оно существует).
// Затем в следующем порядке пробуем удалить окончания:
// ADJECTIVAL, VERB, NOUN.
// Как только одно из них найдено – шаг завершается.
Stemmer.prototype.step_1 = function(word, rv_pos) {
    let match;
    let rv_str = word.substr(rv_pos);

    match = this.re_perfective_gerund1.exec(rv_str);
    if (match !== null) {
        return word.substring(0, rv_pos + match.index + 1);
    }

    match = this.re_perfective_gerund2.exec(rv_str);
    if (match !== null) {
        return word.substring(0, rv_pos + match.index);
    }

    match = this.re_reflexive.exec(rv_str);
    if (match !== null) {
        word = word.substring(0, rv_pos + match.index);
        rv_str = word.substr(rv_pos);
    }

    match = this.re_adjective.exec(rv_str);
    if (match !== null) {
        word = word.substring(0, rv_pos + match.index);
        rv_str = word.substr(rv_pos);

        match = this.re_participle1.exec(rv_str);
        if (match !== null) {
            return word.substring(0, rv_pos + match.index + 1);
        }

        match = this.re_participle2.exec(rv_str);
        if (match !== null) {
            return word.substring(0, rv_pos + match.index);
        }

        return word;
    }

    match = this.re_verb1.exec(rv_str);
    if (match !== null) {
        return word.substring(0, rv_pos + match.index + 1);
    }

    match = this.re_verb2.exec(rv_str);
    if (match !== null) {
        return word.substring(0, rv_pos + match.index);
    }

    match = this.re_noun.exec(rv_str);
    if (match !== null) {
        return word.substring(0, rv_pos + match.index);
    }

    return word;
};

// Шаг 2
// Если слово оканчивается на и – удаляем и.
Stemmer.prototype.step_2 = function(word, rv_pos) {
    let match;
    let rv_str = word.substr(rv_pos);

    match = this.re_i.exec(rv_str);
    if (match !== null) {
        return word.substring(0, rv_pos + match.index);
    }

    return word;
};

// Шаг 3
// Если в R2 найдется окончание DERIVATIONAL – удаляем его.
Stemmer.prototype.step_3 = function(word, r2_pos) {
    let match;
    let r2_str = word.substr(r2_pos);

    match = this.re_derivational.exec(r2_str);
    if (match !== null) {
        return word.substring(0, r2_pos + match.index);
    }

    return word;
};

// Шаг 4
// Возможен один из трех вариантов:
// Если слово оканчивается на нн – удаляем последнюю букву.
// Если слово оканчивается на SUPERLATIVE – удаляем его
// и снова удаляем последнюю букву, если слово оканчивается на нн.
// Если слово оканчивается на ь – удаляем его.
Stemmer.prototype.step_4 = function(word, rv_pos) {
    let match;
    let rv_str = word.substr(rv_pos);

    match = this.re_nn.exec(rv_str);
    if (match !== null) {
        return word.substring(0, rv_pos + match.index + 1);
    }

    match = this.re_superlative.exec(rv_str);
    if (match !== null) {
        word = word.substring(0, rv_pos + match.index);
        rv_str = word.substr(rv_pos);

        match = this.re_nn.exec(rv_str);
        if (match !== null) {
            return word.substring(0, rv_pos + match.index + 1);
        }
    }

    match = this.re.exec(rv_str);
    if (match !== null) {
        return word.substring(0, rv_pos + match.index);
    }

    return word;
};

module.exports.Stemmer = Stemmer;
