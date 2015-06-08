var huffman = (function (huffman) {
    'use strict';

    function HuffmanVisualizer (div, tree) {

        var _width = 800;
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

        _svgRoot.append('g').attr('id','lines');
        _svgRoot.append('g').attr('id','circles');
        _svgRoot.append('g').attr('id','values');

        function render () {
            var treeDepth = maxDepth(_tree);
            var distance = Math.pow(2, treeDepth);
            var min = -distance / 2;
            var max = distance / 2;
            var lines = [];
            var nodes = generate (_tree, 0, distance / 2, 0);
            var offsetX = 10;
            var offsetY = 10;
            var scaleX = (_width - 2 * offsetX) / distance ;
            var scaleY = 20;

            _svgRoot.select('g#lines').selectAll('line')
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

            _svgRoot.select('g#circles').selectAll('circle')
                .data(nodes)
              .enter().append('circle')
                .attr({
                    cx: function (d) { return offsetX + scaleX * d.x; },
                    cy: function (d) { return offsetY + scaleY  * d.y; },
                    r: 10 
                }).style({
                    stroke: 'black',
                    fill: 'white'
                });

            _svgRoot.select('g#values').selectAll('text')
                .data(nodes)
              .enter().append('text')
                .attr({
                    x: function (d) { return offsetX + scaleX * d.x; },
                    y: function (d) { return offsetY + scaleY * d.y; },
                    dy: 5,
                    dx: -5
                }).text(function (d) {return d.value;});

            function generate (node, y, x, prevX) {
                if (node === null) {
                    return [];
                }

                var delta = Math.abs((prevX - x) / 2);
                var left = generate(node.leftChild, y + 1, x - delta, x);
                var right = generate(node.rightChild, y + 1, x + delta, x);
                var obj = {x:x, y:y, value:node.value};
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
