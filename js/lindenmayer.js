var lindenmayer = (function (lindenmayer) {

    var x, y, heading, color, penState, lines;

    function create (div) {
        var svg = d3.select(div).append('svg')
            .attr('id', 'lindenmayer-root')
            .attr('width', 500)
            .attr('height', 500);

        svg.append('rect')
            .attr({
                width: 500,
                height: 500,
                stroke: 'black',
                fill: 'white'
            });

        svg.append('g').attr('id', 'turtle');

        svg.append('g').attr('id', 'drawing');

        x = 50;
        y = 250;

        heading = 0;
        lines = [];

    }

    function move(distance) {
        forward(distance);
        update();
    }

    function turn(degrees) {
        rotate(degrees);
        update();
    }

    function forward (distance) {
        var movement;

        if (penState) {
            movement = {
                x1: x,
                y1: y
            };
        }

        x += distance * Math.cos(heading);
        y += distance * Math.sin(heading);

        if (penState) {
            movement.x2 = x;
            movement.y2 = y;
            lines.push(movement);
        }

    }

    function rotate (degrees) {
        heading += degrees * Math.PI / 180;
    }

    function pen (state) {
        penState = state;
    }

    function draw () {
        var root = d3.select('#lindenmayer-root');

        var turtleScale = 10;

        var front = {
            x: x + turtleScale * Math.cos(heading),
            y: y + turtleScale * Math.sin(heading)
        };

        var left = {
            x: x + turtleScale * Math.cos(heading + (Math.PI/2)),
            y: y + turtleScale * Math.sin(heading + (Math.PI/2))
        };

        var right = {
            x: x + turtleScale * Math.cos(heading - (Math.PI/2)),
            y: y + turtleScale * Math.sin(heading - (Math.PI/2))
        };

        var turtle2 = [
            {
                x: front.x,
                y: front.y,
                color: 'red'
            },
            {
                x: right.x,
                y: right.y,
                color: 'blue'
            },
            {
                x: left.x,
                y: left.y,
                color: 'green'
            },
        ];

        d3.select('#turtle').selectAll('line')
            .data(turtle2)
          .enter().append('line')
            .attr('x1', x)
            .attr('y1', y)
            .attr('x2', function (d) { return d.x; })
            .attr('y2', function (d) { return d.y; })
            .style('stroke', function (d) { return d.color; })
            .style('stroke-width', 1);
    }

    function update() {
        var turtleScale = 10;

        var front = {
            x: x + turtleScale * Math.cos(heading),
            y: y + turtleScale * Math.sin(heading)
        };

        var left = {
            x: x + turtleScale * Math.cos(heading + (Math.PI/2)),
            y: y + turtleScale * Math.sin(heading + (Math.PI/2))
        };

        var right = {
            x: x + turtleScale * Math.cos(heading - (Math.PI/2)),
            y: y + turtleScale * Math.sin(heading - (Math.PI/2))
        };

        var turtle2 = [
            {
                x: front.x,
                y: front.y,
                color: 'red'
            },
            {
                x: right.x,
                y: right.y,
                color: 'blue'
            },
            {
                x: left.x,
                y: left.y,
                color: 'green'
            },
        ];

        d3.select('#turtle').selectAll('line')
            .data(turtle2)
            .attr('x1', x)
            .attr('y1', y)
            .attr('x2', function (d) { return d.x; })
            .attr('y2', function (d) { return d.y; })
            .style('stroke', function (d) { return d.color; })
            .style('stroke-width', 1);

        d3.select('#drawing').selectAll('line')
            .data(lines)
          .enter().append('line')
            .attr({
                x1: function (d) { return d.x1; },
                y1: function (d) { return d.y1; },
                x2: function (d) { return d.x2; },
                y2: function (d) { return d.y2; },
            })
            .style({
                stroke: 'black',
                'stroke-width': 1
            });
    }

    function penUp () {
        pen(false);
    }

    function penDown () {
        pen(true);
    }

    function go () {
        pen(true);
        turtleInterpret(
                        processStep(
                        processStep(
                        processStep(
                        processStep(
                        processStep('0'))))));
        update();
    }

    function rule (variable) {
        if ('0' === variable) {
            return '1[0]0';
        }
        if ('1' === variable) {
            return '11';
        }
        return variable;
    }

    function processStep (input) {
        var newInput = input.split('');

        return newInput.map(function (d) { return rule(d); })
            .reduce(function (a, b) { return a.concat(b); });
    }

    function turtleInterpret (input) {
        var newInput = input.split('');

        var stack = [];

        newInput.map(function (d) {
            if ('1' === d) {
                forward(10);
            }
            if ('0' === d) {
                forward(10);
            }
            if ('[' === d) {
                stack.push({
                    x: x,
                    y: y,
                    heading: heading
                });
                rotate(45);
            }
            if (']' === d) {
                var oldSettings = stack.pop();
                x = oldSettings.x;
                y = oldSettings.y;
                heading = oldSettings.heading;
                rotate(-45);
            }
        });
    }

    lindenmayer.rule = rule;
    lindenmayer.processStep = processStep;
    lindenmayer.go = go;

    lindenmayer.create = create;
    lindenmayer.draw = draw;
    lindenmayer.pen = pen;
    lindenmayer.move = move;
    lindenmayer.turn = turn;
    lindenmayer.penUp = penUp;
    lindenmayer.penDown = penDown;

    return lindenmayer;

}) (lindenmayer || {});
