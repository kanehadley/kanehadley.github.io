var dependency = (function (dependency) {

    dependency.test = [
        ['a', 'b'],
        ['b', 'c'],
        ['d', 'c'],
        ['b', 'e']
    ];

    dependency.graph = [];
    dependency.lookupSource = [];
    dependency.lookupIndex = [];

    dependency.generateGraph = function (data) {
        var symbolCount = 0;
        var lookupSource = {};
        var lookupIndex = {};
        var graph = [];

        data.map(function (d) {
            if (!(d[0] in lookupSource)) {
                lookupSource[d[0]] = symbolCount;
                lookupIndex[symbolCount] = d[0];
                symbolCount++;
            }
            if (!(d[1] in lookupSource)) {
                lookupSource[d[1]] = symbolCount;
                lookupIndex[symbolCount] = d[1];
                symbolCount++;
            }
        });

        for (var i = 0; i < symbolCount; i++) {
            graph[i] = {value: lookupIndex[i],
                        child: [],
                        parent: []};
        }

        data.map(function (d) {
            graph[lookupSource[d[0]]].child.push(d[1]);
            graph[lookupSource[d[1]]].parent.push(d[0]);
        });

        return {graph: graph, lookupSource: lookupSource, lookupIndex: lookupIndex};
    };

    function draw (inputData) {
        var root = d3.select('#dependency-root');


        var output = dependency.generateGraph(inputData);

        var data = output.graph;
        var lookupSource = output.lookupSource;
        var lookupIndex = output.lookupIndex;

        function explore () {

        }

        function height (node) {
            if (0 === node.child.length) {
                return 0;
            }

            return 1 + Math.max.apply(null, node.child.map(function (d) {return height(data[lookupSource[d]]);}));
        }

        function depth (node) {
            if (0 === node.parent.length) {
                return 0;
            }

            return 1 + Math.max.apply(null, node.parent.map(function (d) {
                return depth(data[lookupSource[d]]);
            }));
        }


        function descendants (node) {
            if (0 === node.child.length) {
                return 1;
            }

            return node.child.map(function (d) {
                return descendants(data[lookupSource[d]]);
            })
            .reduce (function (a, b) {return a + b;});
        }

        var newData = JSON.parse(JSON.stringify(data));

        newData = newData.map(function (d, i) {
            return {
                value: lookupIndex[i],
                child: d.child,
                parent: d.parent,
                depth: depth(d),
                descendants: descendants(d),
                height: height(d)
            };
        });


        var row = 0, col = 0;



        var starters = newData.filter(function (d) { return 0 === d.parent.length; })
            .sort(function (a, b) { return a.height < b.height; });

        var finalData = [];


        var current = starters[0];

        function constructArray (node, r, c) {
            var arr = [];

            arr.push({
                x: c,
                y: r
            });

            var newChildren = JSON.parse(JSON.stringify(node.child)).sort(function (a,b) {return a.height < b.height;});
            for (var i = 0; i < newChildren.length; i++) {
                arr = arr.concat(constructArray(newChildren[i], r + newChildren[i].descendants - newChildren[0].descendants, c + 1));
            }

            return arr;
        }

        var superTree = [];

        for(row = 0; row < starters.length; row++) {
            finalData = finalData.concat(constructArray(starters[row], row + starters[row].descendants - starters[0].descendants, col));
        }

        var graphData = data.map(function (d, i) {
            return {
                x: i * 20 + 50,
                y: 100,
                r: 3,
                edges: d.child.map(function (c) {
                    return lookupIndex[c];
                }).concat(d.parent.map(function (p) {
                    return lookupIndex[p];
                }))
            };
        });

        root.selectAll('circle')
            .data(graphData)
          .enter().append('circle')
            .attr('cx', function (d) { return d.x; })
            .attr('cy', function (d) { return d.y; })
            .attr('r', function (d) { return d.r; });

        var line = d3.svg.line()
            .x(function (d) { return d.x; })
            .y(function (d) { return d.y; })
            .interpolate('linear');

        root.selectAll('path')
            .data(graphData)
          .enter().append('path');
    }

    function create (div) {
        var svg = d3.select(div).append('svg')
            .attr('id', 'dependency-root')
            .attr('width', 1000)
            .attr('height', 1000);

        svg.append('rect')
            .attr('width', 1000)
            .attr('height', 1000)
            .style('stroke', 'black')
            .style('fill', 'white');
    }

    dependency.create = create;
    dependency.draw = draw;

    return dependency;
}) (dependency || {});
