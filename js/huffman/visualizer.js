var huffman = (function (huffman) {
    'use strict';

    function HuffmanVisualizer (div, tree) {

        var _width = 700;
        var _height = 700;
        var _tree = tree;
        var _container = d3.select(div);
        var _svgRoot = _container.append('svg').attr({
            width: _width,
            height: _height,
            id: 'root'
        });

        _svgRoot.append('rect').attr({
            x: 0,
            y: 0,
            width: _width,
            height: _height,
            id: 'border'
        }).style({
            stroke: 'black',
            fill: 'none'
        });

        function render () {
            var treeDepth = maxDepth(_tree);
            var distance = Math.pow(2, treeDepth);
            var min = -distance / 2;
            var max = distance / 2;
            var lines = [];
            var nodes = generate (_tree, 0, distance / 2);
            var offsetX = 10;
            var offsetY = 10;
            var scaleX = (_width - 2 * offsetX) / distance ;
            var scaleY = 20;

            var bNodes = nodes.slice(1, nodes.length).concat([nodes[nodes.length - 1]]);

            _svgRoot.selectAll('line')
                .data(lines)
              .enter().append('line')
                .attr({
                    x1: function (d) { return offsetX + scaleX * d[0].x; },
                    y1: function (d) { return offsetY + scaleY * d[0].y; },
                    x2: function (d) { return offsetX + scaleX * d[1].x; },
                    y2: function (d) { return offsetY + scaleY * d[1].y; }
                }).style({
                    stroke: 'black'
                });

            _svgRoot.selectAll('circle')
                .data(nodes)
              .enter().append('circle')
                .attr({
                    cx: function (d) { return offsetX + scaleX * d.x; },
                    cy: function (d) { return offsetY + scaleY  * d.y; },
                    r: 5
                }).style({
                    stroke: 'black',
                    fill: 'none'
                }); 

            function generate (node, y, x) {
                if (node === null) {
                    return [];
                }

                var left = generate(node.leftChild, y + 1, x <= distance / 2 ? x / 2: distance / 2 + (x - distance / 2) / 2);
                var right = generate(node.rightChild, y + 1, x >= distance / 2 ? x + (distance - x) / 2 : x + (((distance / 2) - x) / 2));
                var obj = {x:x, y:y};
                if (left.length > 0) {
                    lines.push([obj, left[0]]);
                }
                if (right.length > 0) {
                    lines.push([obj, right[0]]);
                }

                return [obj].concat(left).concat(right);
            }

            function maxDepth (node) {
                return node === null ? 0 : 1 + Math.max(maxDepth(node.leftChild), maxDepth(node.rightChild));
            }
        }

        return {
            render: render
        };
    }

    huffman.HuffmanVisualizer = HuffmanVisualizer;

    return huffman;
}) (huffman || {});