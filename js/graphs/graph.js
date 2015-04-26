var dependency = (function (dependency) {

    // Directed graph
    function Graph (key) {
        var _key = key;
        var _nodes = [];

        this.addNode = function (key, value) {
            _nodes.push(new Node(key, value));
            return this;
        };

        this.addNeighbor = function (key, neighborKey) {
            var node = this.findNode(key);
            if (node) {
                node.addNeighbor(neighborKey);
            }
            return this;
        };

        // Returns undefined if the node doesn't exist
        this.findNode = function (key) {
            return _nodes.filter(function (d) { return key === d.key(); })[0];
        };

        this.value = function (key, newValue) {
            var node = this.findNode(key);
            if (node) {
                if (newValue) {
                    node.value(newValue);
                    return this;
                } else {
                    return node.value();
                }
            } else {
                return node;
            }
        };

        this.neighbors = function (key) {
            var node = this.findNode(key);
            if (node) {
                return node.neighbors();
            } else {
                return node;
            }
        };

        this.nodes = function () {
            return _nodes.map(function (node) {
                return node.key();
            });
        };

        this.key = function () {
            return _key;
        };
    }

    function Node (key, value) {
        var _neighbors = [];
        var _key = key;
        var _value = value;


        this.addNeighbor = function (neighborKey) {
            if (!(neighborKey in _neighbors)) { _neighbors.push(neighborKey); }
            return this;
        };

        this.removeNeighbor = function (neighborKey) {
            _neighbors = _neighbors.filter(function (d) {
                return neighborKey === d ? false : true;
            });
            return this;
        };

        this.value = function (newValue) {
            if (newValue) { _value = newValue; }
            return newValue ? this : _value;
        };

        this.key = function () { return _key; };

        // Returns an array of the neighbor node keys
        this.neighbors = function () { return _neighbors; };

    }

    dependency.Graph = Graph;
    dependency.Node = Node;

    return dependency;
}) (dependency || {});
