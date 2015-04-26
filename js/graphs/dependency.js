var dependency = (function (dependency) {
    'use strict';

    function test () {
        var dgraph = new dependency.DependencyGraph(d3.select('#dependency-div').node());
        dgraph
            .addNode('a').addNeighbor('root', 'a')
            .addNode('b').addNeighbor('root', 'b')
            .addNode('c').addNeighbor('a', 'c');

        var output = dgraph.convertGraphToVisual(dgraph.graph());

        dgraph.render();

        return [dgraph.graph(), output];
    }

    function DependencyGraph (div) {
        var _graph = new dependency.Graph('dependency-graph').addNode('root', {});
        var _container = div;
        var _root;
        var _width = 1000;
        var _height = 1000;

        _root = d3.select(_container).append('svg')
            .attr({
                id: 'dependency-root',
                width: _width,
                height: _height
            });

        _root.append('rect')
            .attr({
                id: 'border',
                width: _width,
                height: _height
            })
            .style({
                stroke: 'black',
                fill: 'white'
            });

        _root.append('g').attr('id', 'viewer');

        this.graph = function () {
            return _graph;
        };

        this.render = function () {
            var data = convertGraphToVisual(_graph);

            var selection = _root.select('g#viewer')
              .selectAll('rect').data(data);

            selection.exit().remove();

            selection.enter().append('rect');

            selection
                .attr({
                    x: function (d) { return d.x * 100 + 'px'; },
                    y: function (d) { return d.y * 100 + 'px'; },
                    width: 10,
                    height: 10
                })
                .style({
                    fill: 'red'
                });

        };

        this.addNode = function (key, value) {
            _graph.addNode(key, value);
            return this;
        };

        this.addNeighbor = function (key, neighborKey) {
            _graph.addNeighbor(key, neighborKey);
            return this;
        };

        function convertGraphToVisual (graph) {

            var allPaths = generatePaths ([['root']], graph, []);
            var graphHeight = Math.max.apply(null, allPaths.map(function(path){return path.length;}));
            return allPaths.sort(function (a, b) { return b.length - a.length; })
                .map(function (path, rIndex) {
                    var copyPath = JSON.parse(JSON.stringify(path));
                    return copyPath.reverse().map(function (node, cIndex) {
                        return {
                            x: graphHeight - 1 - cIndex,
                            y: rIndex
                        };
                    });
                })
                .reduce(function (pathA, pathB) {
                    return pathA.concat(pathB);
                });
            // A path ends when we reach a leaf node with no neighbors
            function generatePaths (queue, graph, paths) {
                if (queue.length > 0) {
                    var path = queue.shift();
                    var nodeKey = path[0];
                    var nexts = graph.neighbors(nodeKey).map(function (neighbor) {
                        return [neighbor].concat(path);
                    });
                    if (nexts.length > 0) {
                        queue = queue.concat(nexts);
                        return generatePaths(queue, graph, paths);
                    } else {
                        paths.push(path);
                        return generatePaths(queue, graph, paths);
                    }
                } else {
                    return paths.map(function (path) { return path.reverse(); });
                }
            }

        }

        this.convertGraphToVisual = convertGraphToVisual;

    }


    dependency.DependencyGraph = DependencyGraph;
    dependency.test = test;

    return dependency;
}) (dependency || {});
