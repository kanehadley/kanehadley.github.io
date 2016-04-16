var hanoi = (function (hanoi) {
    'use strict';
    function HanoiVisualizer (div, config) {
        var _container = d3.select(div);
        var _config = config;
        var _svg = _container.append('svg').attr({
                'id': 'hanoi',
                width: _config.width,
                height: _config.height
            });

        var _stackOne = [];
        var _stackTwo = [];
        var _stackThree = [];

        _svg.append('rect').attr({
                'id': 'border',
                x: 0,
                y: 0,
                width: _config.width,
                height: _config.height
            }).style({
                'fill': 'none',
                'stroke': 'black'
            });

        _svg.append('g').attr('id', 'stack-one');
        _svg.append('g').attr('id', 'stack-two').attr({
                transform: 'translate(' + _config.width / 3 + ')'
            });
        _svg.append('g').attr('id', 'stack-three').attr({
                transform: 'translate(' + 2 * _config.width / 3 + ')'
            });

        initialize(_config.blocks);

        function initialize (numberBlocks) {
            d3.range(1, numberBlocks + 1).reverse().forEach(function (block) {
                _stackOne.push(block);
            });

            render();
        }

        function move (here, there) {
            // TODO: Do a check to make sure only smaller pieces are on top
            var value;
            if (1 === here) {
                value = _stackOne.pop();
            }
            if (2 === here) {
                value = _stackTwo.pop();
            }
            if (3 === here) {
                value = _stackThree.pop();
            }

            if (value) {
                if (1 === there) {
                    _stackOne.push(value);
                }
                if (2 === there) {
                    _stackTwo.push(value);
                }
                if (3 === there) {
                    _stackThree.push(value);
                }
            }

            render();
        }

        function render () {
            drawStack('g#stack-one', _stackOne);
            drawStack('g#stack-two', _stackTwo);
            drawStack('g#stack-three', _stackThree);
        }

        function drawStack (stackId, stack) {
            var centerAxis = (_config.width / 3) / 2;
            var unitsToPixel = 10;
            var rectSelection = _svg.select(stackId).selectAll('rect')
                .data(stack);

            rectSelection.exit().remove();
            rectSelection.enter().append('rect');
            rectSelection.attr({
                    x: function (d) { return centerAxis - (d * unitsToPixel / 2); },
                    y: function (d, i) { return (stack.length - i) * unitsToPixel; },
                    width: function (d) { return d*unitsToPixel;},
                    height: unitsToPixel
                }).style({
                    stroke: 'black'
                });
        }

        this.move = move;

    }

    hanoi.HanoiVisualizer = HanoiVisualizer;
    return hanoi;
}) (hanoi || {});
