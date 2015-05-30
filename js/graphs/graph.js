var dependency = (function (dependency) {
    'use strict';

    // Directed graph
    function Graph (initialKey) {
        var _key = initialKey;
        var _nodes = [];
        var that = this;

        function addNode (key, value) {
            _nodes.push(new Node(key, value));
            return that;
        }

        function addNeighbor (nodeKey, neighborKey) {
            var node = that.find(nodeKey);
            if (node) {
                node.addNeighbor(neighborKey);
            }
            return that;
        }

        // Returns undefined if the node doesn't exist
        function find (key) {
            return _nodes.filter(function (d) { return key === d.key(); })[0];
        }

        function value (key, newValue) {
            var node = that.find(key);
            if (node) {
                if (newValue) {
                    node.value(newValue);
                    return that;
                } else {
                    return node.value();
                }
            } else {
                return node;
            }
        }

        function neighbors (key) {
            var node = that.find(key);
            if (node) {
                return node.neighbors();
            } else {
                return node;
            }
        }

        function nodes () {
            return _nodes.map(function (node) {
                return node.key();
            });
        }

        function key () {
            return _key;
        }

        this.addNode = addNode;
        this.addNeighbor = addNeighbor;
        this.find = find;
        this.value = value;
        this.neighbors = neighbors;
        this.nodes = nodes;
        this.key = key;
    }

    function Node (initialKey, initialValue) {
        var _neighbors = [];
        var _key = initialKey;
        var _value = initialValue;
        var that = this;

        function addNeighbor (neighborKey) {
            if (!(neighborKey in _neighbors)) { _neighbors.push(neighborKey); }
            return that;
        }

        function removeNeighbor (neighborKey) {
            _neighbors = _neighbors.filter(function (d) {
                return neighborKey === d ? false : true;
            });
            return that;
        }

        function value (newValue) {
            if (newValue) { _value = newValue; }
            return newValue ? that : _value;
        }

        function key () { return _key; }

        // Returns an array of the neighbor node keys
        function neighbors () { return _neighbors; }

        this.addNeighbor = addNeighbor;
        this.removeNeighbor = removeNeighbor;
        this.value = value;
        this.key = key;
        this.neighbors = neighbors;
    }

    dependency.Graph = Graph;
    dependency.Node = Node;

    return dependency;
}) (dependency || {});
