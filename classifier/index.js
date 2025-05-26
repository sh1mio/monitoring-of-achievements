'use strict';

function Node()
{
    this.categories = new Set();
    this.nodes = new Map();
}

function Classifier(tokenizer)
{
    this.tokenizer = tokenizer;
    this.root = new Node();
}

Classifier.prototype.train = function(text, category) {
    let tokens = this.tokenizer.tokenize(text);

    if (tokens.length === 0) {
        return;
    }

    let node = this.root;

    for (let i = 0; i < tokens.length; ++i) {
        if (node.nodes.has(tokens[i])) {
            node = node.nodes.get(tokens[i]);
        } else {
            let obj = new Node();
            node.nodes.set(tokens[i], obj);
            node = obj;
        }
    }

    node.categories.add(category);
};

Classifier.prototype.classify = function(text) {
    let tokens = this.tokenizer.tokenize(text);

    if (tokens.length === 0) {
        return null;
    }

    let categories = new Map();
    let node;

    for (let i = 0; i < tokens.length; ++i) {
        node = this.root;

        for (let j = i; j < tokens.length; ++j) {
            if (node.nodes.has(tokens[j])) {
                node = node.nodes.get(tokens[j]);

                for (let key of node.categories) {
                    if (categories.has(key)) {
                        let n = categories.get(key);
                        categories.set(key, n + 1);
                    } else {
                        categories.set(key, 1);
                    }
                }
            } else {
                break;
            }
        }
    }

    if (categories.size === 0) {
        return null;
    }

    let result = [];

    for (let key of categories) {
        result.push({
            "category": key[0],
            "total": key[1]
        });
    }

    result.sort(compare);

    return result;
};

function compare(a, b)
{
    if (a.total < b.total) {
        return 1;
    } else if (a.total > b.total) {
        return -1;
    } else {
        return 0;
    }
}

module.exports = Classifier;
