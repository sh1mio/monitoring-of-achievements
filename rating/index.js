'use strict';

const querystring = require('querystring');
const http = require('http');
const mysql = require('mysql');
const Classifier = require('./../classifier');
const Tokenizer = require('./../tokenizer');
const stopList = require('./../db/stoplist.js');
const exceptionStem = require('./../db/exceptionStem.js');
const dbInstitutions = require('./../db/institutions.js');
const dbUrfu = require('./../db/urfu.js');
const dbKindsOfSports = require('./../db/kindsofsports.js');
const dbPerson = require('./../db/person.js');
const dbSport = require('./../db/sport.js');

function Rating()
{
    this.rating = {
        ratingUrfu: {},
        ratingUrfuSports: {},
        ratingUrfuPerson: {},
        ratingInstitutions: {}
    };
    this.offset = 0;
    this.count = 100;
    this.delay = 100;
    this.delaySave = 1 * 60 * 1000;
    this.tokenizer = new Tokenizer(stopList, exceptionStem);
    this.classifierInstitutions = new Classifier(this.tokenizer);
    this.classifierUrfu = new Classifier(this.tokenizer);
    this.classifierKindsOfSports = new Classifier(this.tokenizer);
    this.classifierPerson = new Classifier(this.tokenizer);
    this.classifierSport = new Classifier(this.tokenizer);

    for (let i = 0; i < dbInstitutions.length; ++i) {
        this.rating.ratingInstitutions[dbInstitutions[i].category] = 0;

        for (let j = 0; j < dbInstitutions[i].text.length; ++j) {
            this.classifierInstitutions.train(dbInstitutions[i].text[j], dbInstitutions[i].category);
        }
    }

    for (let i = 0; i < dbUrfu.length; ++i) {
        this.rating.ratingUrfu[dbUrfu[i].category] = 0;

        for (let j = 0; j < dbUrfu[i].text.length; ++j) {
            this.classifierUrfu.train(dbUrfu[i].text[j], dbUrfu[i].category);
        }
    }

    for (let i = 0; i < dbKindsOfSports.length; ++i) {
        this.rating.ratingUrfuSports[dbKindsOfSports[i].category] = 0;

        for (let j = 0; j < dbKindsOfSports[i].text.length; ++j) {
            this.classifierKindsOfSports.train(dbKindsOfSports[i].text[j], dbKindsOfSports[i].category);
        }
    }

    for (let i = 0; i < dbPerson.length; ++i) {
        this.rating.ratingUrfuPerson[dbPerson[i].category] = 0;

        for (let j = 0; j < dbPerson[i].text.length; ++j) {
            this.classifierPerson.train(dbPerson[i].text[j], dbPerson[i].category);
        }
    }

    for (let i = 0; i < dbSport.length; ++i) {
        for (let j = 0; j < dbSport[i].text.length; ++j) {
            this.classifierSport.train(dbSport[i].text[j], dbSport[i].category);
        }
    }
}

Rating.prototype.init = function(cb) {
    let self = this;

    self.mysqlPool = mysql.createPool({
        connectionLimit: 10,
        host: 'localhost',
        user: 'ratingurfu',
        password: 'ratingurfu'
    });

    self.mysqlPool.query('CREATE DATABASE IF NOT EXISTS `rating` CHARACTER SET utf8 COLLATE utf8_general_ci;', function(err, result) {
        if (err) {
            process.nextTick(cb, err);
            return;
        }

        self.mysqlPool.query('CREATE TABLE IF NOT EXISTS `rating`.`urfu` (`id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT, `name` TEXT NOT NULL, `count` INT(11) UNSIGNED NOT NULL, `date` DATE NOT NULL, UNIQUE(`id`));', function(err, result) {
            if (err) {
                process.nextTick(cb, err);
                return;
            }

            self.mysqlPool.query('CREATE TABLE IF NOT EXISTS `rating`.`sport` (`id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT, `name` TEXT NOT NULL, `count` INT(11) UNSIGNED NOT NULL, `date` DATE NOT NULL, UNIQUE(`id`));', function(err, result) {
                if (err) {
                    process.nextTick(cb, err);
                    return;
                }

                process.nextTick(cb, null);
            });
        });
    });
};

Rating.prototype.scan = function(cb) {
    let self = this;

    let query = `SELECT * FROM \`spider\`.\`pages\` ORDER BY \`id\` LIMIT ${self.offset}, ${self.count};`;

    self.mysqlPool.query(query, function(err, res) {
        if (!err) {
            if (Array.isArray(res)) {
                if (res.length > 0) {
                    self.offset += self.count;

                    self.classifyArr(0, res, function(err) {
                        setTimeout(function() {
                            self.scan();
                        }, self.delay);
                    });
                } else {
                    self.save(function() {
                        console.log('\nsave');

                        self.offset = 0;
                        self.rating = {
                            ratingUrfu: {},
                            ratingUrfuSports: {},
                            ratingUrfuPerson: {},
                            ratingInstitutions: {}
                        };

                        for (let i = 0; i < dbInstitutions.length; ++i) {
                            self.rating.ratingInstitutions[dbInstitutions[i].category] = 0;
                        }

                        for (let i = 0; i < dbUrfu.length; ++i) {
                            self.rating.ratingUrfu[dbUrfu[i].category] = 0;
                        }

                        for (let i = 0; i < dbKindsOfSports.length; ++i) {
                            self.rating.ratingUrfuSports[dbKindsOfSports[i].category] = 0;
                        }

                        for (let i = 0; i < dbPerson.length; ++i) {
                            self.rating.ratingUrfuPerson[dbPerson[i].category] = 0;
                        }

                        setTimeout(function() {
                            self.scan();
                        }, self.delaySave);
                    });
                }
            } else {
                setTimeout(function() {
                    self.scan();
                }, self.delay);
            }
        } else {
            setTimeout(function() {
                self.scan();
            }, self.delay);
        }
    });
};

Rating.prototype.classifyArr = function(index, arr, cb) {
    let self = this;

    if (index < arr.length) {
        self.classify(arr[index].url, arr[index].text, function() {
            process.nextTick(function() {
                self.classifyArr(index + 1, arr, cb);
            });
        });
    } else {
        process.nextTick(cb);
    }
};

Rating.prototype.classify = function(url, text, cb) {
    let self = this;

    let categoryInstitutions = self.classifierInstitutions.classify(text);

    if (categoryInstitutions) {
        let set = new Set(['Уральский федеральный университет имени первого Президента России Б. Н. Ельцина'])
        if (set.has(categoryInstitutions[0].category))
        {
            let categorySport = self.classifierSport.classify(text);

            if (categorySport) {
                if (categoryInstitutions[0].category in self.rating.ratingInstitutions) {
                    self.rating.ratingInstitutions[categoryInstitutions[0].category]++;
                } else {
                    self.rating.ratingInstitutions[categoryInstitutions[0].category] = 1;
                }
            }

            let categoryUrfu = self.classifierUrfu.classify(text);

            if (categoryUrfu) {
                for (let i = 0; i < categoryUrfu.length; ++i) {
                    if (categoryUrfu[i].total > 0) {
                        if (categoryUrfu[i].category in self.rating.ratingUrfu) {
                            self.rating.ratingUrfu[categoryUrfu[i].category]++;
                        } else {
                            self.rating.ratingUrfu[categoryUrfu[i].category] = 1;
                        }
                    }
                }
            }

            let categoryKindsOfSports = self.classifierKindsOfSports.classify(text);

            if (categoryKindsOfSports) {
                for (let i = 0; i < categoryKindsOfSports.length; ++i) {
                    if (categoryKindsOfSports[i].total > 0) {
                        if (categoryKindsOfSports[i].category in self.rating.ratingUrfuSports) {
                            self.rating.ratingUrfuSports[categoryKindsOfSports[i].category]++;
                        } else {
                            self.rating.ratingUrfuSports[categoryKindsOfSports[i].category] = 1;
                        }
                    }
                }
            }
        } else {
            let categorySport = self.classifierSport.classify(text);

            if (categorySport) {
                if (categoryInstitutions[0].category in self.rating.ratingInstitutions) {
                    self.rating.ratingInstitutions[categoryInstitutions[0].category]++;
                } else {
                    self.rating.ratingInstitutions[categoryInstitutions[0].category] = 1;
                }
            }
        }
    }

    let categoryPerson = self.classifierPerson.classify(text);

    if (categoryPerson) {
        for (let i = 0; i < categoryPerson.length; ++i) {
            if (categoryPerson[i].total > 0) {
                if (categoryPerson[i].category in self.rating.ratingUrfuPerson) {
                    self.rating.ratingUrfuPerson[categoryPerson[i].category]++;
                } else {
                    self.rating.ratingUrfuPerson[categoryPerson[i].category] = 1;
                }
            }
        }
    }

    process.nextTick(cb);
};

/**
 * cb : function(err: object, buffer: Buffer)
 */
Rating.prototype.get = function(path, cb) {
    let time = 15 * 1000;
    let timeout = null;

    let state = true;

    try {
        let request = http.get(path, function(response) {
            let buffer = null;

            response.on('error', function(err) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }

                if (state) {
                    state = false;
                    process.nextTick(cb, err);
                }
            });

            response.on('data', function(data) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }

                timeout = setTimeout(function() {
                    request.abort();
                }, time);

                if (data) {
                    if (buffer) {
                        buffer = Buffer.concat([buffer, data]);
                    } else {
                        buffer = data;
                    }
                }
            });

            response.on('end', function() {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }

                if (state) {
                    state = false;
                    process.nextTick(cb, null, buffer);
                }
            });
        });

        request.on('error', function(err) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }

            if (state) {
                state = false;
                process.nextTick(cb, err);
            }
        });

        timeout = setTimeout(function() {
            request.abort();
        }, time);
    } catch (err) {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }

        if (state) {
            state = false;
            process.nextTick(cb, err);
        }
    }
};

Rating.prototype.save = function(cb) {
    let self = this;

    let arr = [];

    for (let table in self.rating) {
        for (let key in self.rating[table]) {
            arr.push({
                "pass": "rating",
                "table": table.toLowerCase(),
                "name": key,
                "count": self.rating[table][key]
            });
        }
    }

    self.saveFrame(0, arr, cb);
};

Rating.prototype.saveFrame = function(index, arr, cb) {
    let self = this;

    if (index < arr.length) {
        let query = querystring.stringify(arr[index]);

        self.get(`http://ra-first.com/save.php?${query}`, function(err, res) {
            setTimeout(function(params) {
                self.saveFrame(index + 1, arr, cb);
            }, 100);
        });
    } else {
        process.nextTick(cb);
    }
};

module.exports = Rating;
