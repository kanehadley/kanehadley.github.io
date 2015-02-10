var automata = (function (automata) {
    'use strict';

    var width = 500,
        height = 250,
        rows = 10,
        cols = 20,
        grid = null,
        root,
        play = false,
        runController = null,
        worldWrap = true;


    var iToXY = null,
        xyToI = null;


    /** Clears all squares on the grid */
    function clear () {
        grid.forEach(function (element, index, array) { array[index] = 0; });
        update();
    }


    automata.g = function () {
        return grid;
    };


    /** Creates the root SVG element */
    automata.create = function () {
        root = d3.select('body').append('svg')
            .attr('id', 'automata')
            .attr('width', width + 'px')
            .attr('height', height + 'px');
        setup(cols, rows);
    };


    /**
     * Creates and initializes the grid with values.
     * @param - Integer - numColumns - Number of columns in the grid.
     * @param - Integer - numRows - Number of rows in the grid.
     */
    function setup (numColumns, numRows) {
        var len = numColumns * numRows;
        grid = new Array(len);

        for (var index = 0; index < len; index++) {
            grid[index] = parseInt(Math.random()*2);
        }

        iToXY = function (i) {
            return { x: i % numColumns, y: parseInt(i / numColumns) };
        };

        xyToI = function (x, y) { return y * cols + x; };

        draw();
    }


    function queryGrid(x, y, dx, dy) {
        if (worldWrap) {
            /* Make the values positive for the modulus to work */
            return grid[xyToI((x + dx + cols) % cols,
                        (y + dy + rows) % rows)];
        } else {
            return (y + dy < 0 || y + dy > rows - 1 ||
                    x + dx < 0 || x + dx > cols - 1) ?
                    0 : grid[xyToI(x + dx, y + dy)];
        }
    }


    /** Helper functions to query the neighbor values for the cell at x, y */
    function u (x, y) { return queryGrid(x, y, 0, -1); }
    function ul (x, y) { return queryGrid(x, y, -1, -1); }
    function ur (x, y) { return queryGrid(x, y, 1, -1); }
    function l (x, y) { return queryGrid(x, y, -1, 0); }
    function r (x, y) { return queryGrid(x, y, 1, 0); }
    function d (x, y) { return queryGrid(x, y, 0, 1); }
    function dl (x, y) { return queryGrid(x, y, -1, 1); }
    function dr (x, y) { return queryGrid(x, y, 1, 1); }


    function step () {
        calculate();
        automata.update();
    }


    function run () {
        step();
        runController = setInterval(step, 1000 / 2);
    }


    function stop () {
        clearInterval(runController);
    }


    function calculate () {
        var neighbors = 0;

        var newGrid = grid.slice(0);

        grid.forEach(function (element, index, array) {
            var x, y;
            x = iToXY(index).x;
            y = iToXY(index).y;
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


    function draw () {
        var w = width / cols;
        var h = height / rows;
        d3.select('#automata').selectAll('rect')
            .data(grid)
          .enter().append('rect')
            .attr('x', function (d, i) { return iToXY(i).x * w; })
            .attr('y', function (d, i) { return iToXY(i).y * h; })
            .attr('width', w)
            .attr('height', h)
            .style('fill', function (d) { return d ? 'red' : 'white'; })
            .style('stroke', 'black')
            .on('click', function (d, i) {
                grid[i] = grid[i] ? 0 : 1;
                automata.update();
            });
    }


    function update () {
        d3.select('#automata').selectAll('rect')
            .data(grid)
            .style('fill', function (d) { return d ? 'red' : 'white'; });
    }


    automata.clear = clear;
    automata.run = run;
    automata.stop = stop;
    automata.step = step;
    automata.draw = draw;
    automata.update = update;

    return automata;

}) (automata || {});
