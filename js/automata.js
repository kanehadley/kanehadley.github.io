var automata = (function (automata) {
    'use strict';

    var width = 500;
    var height = 250;
    var rows = 10;
    var cols = 20;
    var grid = null;
    var root;
    var getXY;
    var play = false;
    var runController = null;

    var xyToI = null;

    automata.clear = function () {
        grid.forEach(function (element, index, array) {
            array[index] = 0;
        });
        automata.update();
    };

    automata.g = function () {
        return grid;
    };

    automata.create = function () {
        root = d3.select('body').append('svg')
            .attr('id', 'automata')
            .attr('width', width + 'px')
            .attr('height', height + 'px');
        setup(cols, rows);
    };

    function setup ( numColumns, numRows ) {
        var len = numColumns * numRows;
        grid = new Array(len);

        for (var index = 0; index < len; index++) {
            grid[index] = parseInt(Math.random()*2);
        }

        getXY = function (i) {
            return { x: i % numColumns, y: parseInt(i / numColumns) };
        };

        xyToI = function (x, y) { return y * cols + x; };

        automata.draw();
    }

    function u (x, y) {
        if (0 === y) { return 0; }
        return grid[xyToI(x, y - 1)];
    }

    function ul (x, y) {
        if (0 === y) { return 0; }
        if (0 === x) { return 0; }
        return grid[xyToI(x - 1, y - 1)];
    }

    function ur (x, y) {
        if (0 === y) { return 0; }
        if (cols - 1 === x) { return 0; }
        return grid[xyToI(x + 1, y - 1)];
    }

    function l (x, y) {
        if (0 === x) { return 0; }
        return grid[xyToI(x - 1, y)];
    }

    function r (x, y) {
        if (cols - 1 === x) { return 0; }
        return grid[xyToI(x + 1, y)];
    }

    function d (x, y) {
        if (rows - 1 === y) { return 0; }
        return grid[xyToI(x, y + 1)];
    }

    function dl (x, y) {
        if (rows - 1 === y) { return 0; }
        if (0 === x) { return 0; }
        return grid[xyToI(x - 1, y + 1)];
    }

    function dr (x, y) {
        if (rows - 1 === y) { return 0; }
        if (cols - 1 === x) { return 0; }
        return grid[xyToI(x + 1, y + 1)];
    }


    automata.run = function () {
        automata.step();
        runController = setInterval(automata.step, 1000 / 2);
    };

    automata.stop = function () {
        clearInterval(runController);
    };

    function calculate () {
        var neighbors = 0;

        var newGrid = grid.slice(0);

        grid.forEach(function (element, index, array) {
            var x, y;
            x = getXY(index).x;
            y = getXY(index).y;
            neighbors = u(x, y) + ur(x, y) + r(x, y) + dr(x, y) + d(x, y) + dl(x, y) + l(x, y) + ul(x, y);
            if (1 === element) {
                if (neighbors < 2) {
                    newGrid[index] = 0;
                }
                else if (neighbors > 3) {
                    newGrid[index] = 0;
                }
            }
            else if (3 === neighbors) {
                newGrid[index] = 1;
            }
        });

        grid = newGrid;
    }

    automata.step = function () {
        calculate();
        automata.update();
    };

    automata.draw = function () {
        var w = width / cols;
        var h = height / rows;
        d3.select('#automata').selectAll('rect')
            .data(grid)
          .enter().append('rect')
            .attr('x', function (d, i) { return getXY(i).x * w; })
            .attr('y', function (d, i) { return getXY(i).y * h; })
            .attr('width', w)
            .attr('height', h)
            .style('fill', function (d) { return d ? 'red' : 'white'; })
            .style('stroke', 'black')
            .on('click', function (d, i) {
                grid[i] = grid[i] ? 0 : 1;
                automata.update();
            });
    };

    automata.update = function () {
        d3.select('#automata').selectAll('rect')
            .data(grid)
            .style('fill', function (d) { return d ? 'red' : 'white'; });
    };

    return automata;
}) (automata || {});
