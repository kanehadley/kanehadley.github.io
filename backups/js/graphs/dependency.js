var dependency = (function (dependency) {
    'use strict';

    function test (dgraph) {
        dgraph
            .addNode('a').addNeighbor('root', 'a')
            .addNode('b').addNeighbor('root', 'b')
            .addNode('c').addNeighbor('a', 'c');

        //var output = dgraph.convertGraphToVisual(dgraph.graph());

        dgraph.render();

        return [dgraph.graph(), output];
    }

    function DependencyGraph (div) {
        var _graph = new dependency.Graph('dependency-graph');
        var _container = div;
        var _root;
        var _width = 1000;
        var _height = 600;
        var that = this;

        _graph.addNode('root', {});
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

        function graph () {
            return _graph;
        }

        function render () {
            var depthPixels = 100;
            var data = convertGraphToVisual(_graph);
            data = graphToImage(_graph);

            var selection = _root.select('g#viewer')
              .selectAll('rect').data(data);

            selection.exit().remove();

            selection.enter().append('rect');

            selection
                .attr({
                    x: function (d) { return d.x * depthPixels + 'px'; },
                    y: function (d) { return d.y * depthPixels + 'px'; },
                    width: 10,
                    height: 10
                })
                .style({
                    fill: 'red'
                });

            var textSelection = _root.select('g#viewer')
                .selectAll('text').data(data);

            textSelection.exit().remove();
            textSelection.enter().append('text');

            textSelection.attr({
                    x: function (d) { return d.x * depthPixels + 'px'; },
                    y: function (d) { return d.y * depthPixels + 'px'; },
            }).text(function (d) { return d.key; });

        }

        function addNode (key, value) {
            _graph.addNode(key, value);
            return that;
        }

        function addNeighbor (nodeKey, neighborKey) {
            _graph.addNeighbor(nodeKey, neighborKey);
            return that;
        }

        function graphToImage (graph) {
            var depths = generateDepths('root', {}, 0);
            var nodeKeys = _graph.nodes();
            var depthMax = {};
            var depthCount = {};
            d3.range(Object.keys(depths).length).forEach(function (depth) {
                depthMax[depth] = Object.keys(depths).map(function (key) { return depths[key]; }).filter(function (nodeDepth) { return nodeDepth === depth; }).length;
                depthCount[depth] = 0;
            });
            var height = depthMax[findWidestDepth(depths)];

            var shapes = nodeKeys.map(function (nodeKey) {
                return {
                    key: nodeKey,
                    x: depths[nodeKey],
                    y: (function () {
                            var depth = depths[nodeKey];
                            var bestHeight = Math.floor(depthCount[depth] + ((height - depthMax[depth]) / 2));

                            depthCount[depth] += 1;
                            return bestHeight;
                        })() 
                };
            });

            return shapes;

            function generateDepths (node, depths, depthCount) {
                depths[node] = depthCount;

                graph.neighbors(node).forEach(function (neighbor) {
                    depths = generateDepths(neighbor, depths, depthCount + 1);
                });

                return depths;
            }

            function findWidestDepth (depths) {
                var depthMap = Object.keys(depths).map(function (key) {
                    return depths[key];
                });
                return d3.range(Object.keys(depths).length).map(function (depth) {
                    return [depth, depthMap.filter(function (nodeDepth) { return nodeDepth === depth; }).length];
                }).reduce(function (depthA, depthB) {
                    return depthA[1] > depthB[1] ? depthA : depthB;
                })[0];
            }
        }

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

        this.addNode = addNode;
        this.addNeighbor = addNeighbor;
        this.graph = graph;
        this.render = render;
    }


    dependency.DependencyGraph = DependencyGraph;
    dependency.test = test;

    return dependency;
}) (dependency || {});
