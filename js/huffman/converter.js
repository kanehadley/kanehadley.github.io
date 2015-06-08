var huffman = (function (huffman) {
    'use strict';

    function Converter (input) {

        var _alphabet = [];
        var _weights = {};
        var _source = input || '';
        var _codingTree = {};
        var _table = {};

        generateAlphabet();
        generateWeights();
        generateCodingTree();
        generateCodingTable();

        function compress () {

        }

        function generateAlphabet () {
            _alphabet = [];
            _source.split('').forEach(function (character) {
                if (_alphabet.indexOf(character) < 0) {
                    _alphabet.push(character);
                }
            });
        }

        function generateWeights () {
            var total = 0;

            _weights = {};
            _source.split('').forEach(function (character) {
                _weights[character] = _weights[character] || 0 + 1;
                total += 1;
            });

            Object.keys(_weights).forEach(function (key) {
                _weights[key] = _weights[key] / total;
            });
        }

        function generateCodingTree () {
            var nodeList = _alphabet.map(function (symbol) {
                return {
                    parent: null,
                    leftChild: null,
                    rightChild: null,
                    weight: _weights[symbol],
                    value: symbol
                };
            });


            while (nodeList.length > 1) {
                nodeList.sort(function (nodeA, nodeB) {
                    return nodeA.weight - nodeB.weight;
                });
                var lNode = nodeList.shift();
                var rNode = nodeList.shift();
                var innerNode = {
                    parent: null,
                    leftChild: lNode,
                    rightChild: rNode,
                    weight: lNode.weight + rNode.weight,
                    value: null
                };
                lNode.parent = innerNode;
                rNode.parent = innerNode;

                nodeList.push(innerNode);
            }

            _codingTree = nodeList[0];
        }

        function generateCodingTable () {

            _table = {};
            generate(_codingTree).forEach(function (code) {
                _table[code[0]] = code[1];
            });

            function generate (node) {
                if (node.value) {
                    return [[node.value, '']];
                }
                var left = generate(node.leftChild);
                var right = generate(node.rightChild);
                left = left.map(function (code) {
                    return [code[0], '0' + code[1]];
                });
                right = right.map(function (code) {
                    return [code[0], '1' + code[1]];
                });
                return left.concat(right);
            }
        }

        function alphabet () { return _alphabet; }
        function weights () { return _weights; }
        function source () { return _source; }
        function tree () { return _codingTree; }
        function table () { return _table; }

        return {
            alphabet: alphabet,
            weights: weights,
            tree: tree,
            source: source,
            table: table
        };
    }

    huffman.Converter = Converter;

    return huffman;
}) (huffman || {});
