function primGenerator (config) {
    var _width = 810;
    var _height = 610;

    var _sideLength = 10;

    var _rows = ((_height / _sideLength) / 2) - 1;
    var _cols = ((_width / _sideLength) / 2) - 1;

    var _cells = [];

    var _wallList = [];

    var _rooms = [];

    var _passages = [];

    var _potentials = [];

    var _div = d3.select(config.divId);
    var _svg = _div.append('svg').attr({
        'width': _width,
        'height': _height
    });

    var _background = _svg.append('g').append('rect');

    var _border = _svg.append('g');

    var _rects = _svg.append('g');

    _cells = (function () {
        return d3.range(_cols).map(function (i) {
            return d3.range(_rows).map(function (j) {
                return [i, j];
            });
        }).reduce(function (a, b) { return a.concat(b); });
    })();

    _rooms = [[0,0]];

    addNeighbors(0, 0);

    function prim () {
        _background.attr({
            'width': _width,
            'height': _height
        }).style({
            'fill': 'black'
        });

        drawBorder();
        drawRects();
        
    }

    function solve () {
        debugger;
    }

    function step () {
        // Pick cell and add it to accepted
        // Add walls of accepted to potential paths
        // While walls in list
        //    Pick random wall from list
        var wall = _wallList.splice(parseInt(Math.random() * _wallList.length),1)[0];
        //    If cell on opposite side isn't in maze then
        if (-1 === elementIndex(_rooms, wall[1][0], wall[1][1])) {
        //        add the cell to the accepted
            _rooms.push([wall[1][0], wall[1][1]]);
            _passages.push(wall);
            _cells.splice(elementIndex(_cells, wall[1][0], wall[1][1]), 1);
        //        add the cell's walls to the wall list
            addNeighbors(wall[1][0], wall[1][1]);
            _wallList = _wallList.filter(function (d) {
                return -1 === elementIndex(_rooms, d[1][0], d[1][1]);
            });
        }
        //    Remove wall from wall list

        prim();
    }

    function step10 () {
        d3.range(10).forEach(function () { step(); });
    }

    function addNeighbors (x, y) {
        _wallList = _wallList.concat([
            [-1, 0],
            [0, -1],
            [1, 0],
            [0, 1]
        ].map(function (d) {
            return [x + d[0], y + d[1]];
        }).filter(function (d) {
            return d[0] > -1 && d[1] > -1 && d[0] < _cols && d[1] < _rows;
        }).map(function (d) {
            return [[x, y], d];
        }));
    }

    function elementIndex (arr, x, y) {
        var index = -1;
        arr.forEach(function (d, i) {
            if (d[0] === x && d[1] === y) {
                index = i;
            }
        });

        return index;
    }

    function drawRects () {
        var rectData = generateCells(_cells);
        rectData = rectData.concat(generateRooms(_rooms));
        rectData = rectData.concat(generatePassages(_passages));
        rectData = rectData.concat(generatePotentials(_wallList));

        var r = _rects.selectAll('rect').data(rectData);

        r.exit().remove();
        r.enter().append('rect');
        r.attr({
            'x': function (d) { return d.x; },
            'y': function (d) { return d.y; },
            'width': function (d) { return d.width; },
            'height': function (d) { return d.height; }
        }).style({
            'fill': function (d) { return d.color; }
        });

    }

    function generateCells (cells) {
        return cells.map(function (cell) {
            var x = cell[0],
                y = cell[1];

            return {
                'x': (1 + (x * 2)) * _sideLength,
                'y': (1 + (y * 2)) * _sideLength,
                'width': _sideLength,
                'height': _sideLength,
                'color': 'gray'
            };
        });
    }

    function generateRooms (rooms) {
        return rooms.map(function (room) {
            var x = room[0],
                y = room[1];

            return {
                'x': (1 + (x * 2)) * _sideLength,
                'y': (1 + (y * 2)) * _sideLength,
                'width': _sideLength,
                'height': _sideLength,
                'color': 'white'
            };
        });
    }

    function generatePassages (passages) {
        return passages.map(function (passage) {
            var x1 = passage[0][0],
                y1 = passage[0][1],
                x2 = passage[1][0],
                y2 = passage[1][1];

            return {
                'x': (1 + (Math.min(x1, x2) * 2)) * _sideLength,
                'y': (1 + (Math.min(y1, y2) * 2)) * _sideLength,
                'width': ((Math.abs(x2 - x1) * 2) + 1) * _sideLength,
                'height': ((Math.abs(y2 - y1) * 2) + 1) * _sideLength,
                'color': 'white'
            };
        });
    }

    function generatePotentials (walls) {
        return walls.map(function (wall) {
            return [wall[1][0], wall[1][1]];
        }).map(function (room) {
            var x = room[0],
                y = room[1];

            return {
                'x': (1 + (x * 2)) * _sideLength,
                'y': (1 + (y * 2)) * _sideLength,
                'width': _sideLength,
                'height': _sideLength,
                'color': 'blue'
            };
        });
    }

    function drawBorder () {
        var borderRects = [
            {
                'x': 0,
                'y': 0,
                'width': _width,
                'height': _sideLength
            },
            {
                'x': _width - _sideLength,
                'y': 0,
                'width': _sideLength,
                'height': _height 
            },
            {
                'x': 0,
                'y': _height - _sideLength,
                'width': _width,
                'height': _sideLength
            },
            {
                'x': 0,
                'y': 0,
                'width': _sideLength,
                'height': _height
            }
        ];

        var _b = _border.selectAll('rect').data(borderRects);
        _b.exit().remove();
        _b.enter().append('rect');
        _b.attr({
            'x': function (d) { return d.x; },
            'y': function (d) { return d.y; },
            'width': function (d) { return d.width; },
            'height': function (d) { return d.height; }
        }).style({
            'fill': 'red'
        });
    }

    prim.solve = solve;
    prim.step = step;
    prim.step10 = step10;

    return prim;

}

function main () {
    var config = {
        'divId': '#maze'
    };

    var prim = primGenerator(config);

    //prim.solve();
    //prim();
    return prim;

}
