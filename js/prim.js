function primGenerator (config) {
    var _width = 800;
    var _height = 600;

    var _sideLength = 10;

    var _rows = ((_height / _sideLength) / 2) - 1;
    var _cols = ((_width / _sideLength) / 2) - 1;

    var _cells = [];

    var _walls = [];

    var _passages = [];

    var _div = d3.select(config.divId);
    var _svg = _div.append('svg').attr({
        'width': _width,
        'height': _height
    });

    var _background = _svg.append('g').append('rect');

    var _border = _svg.append('g');

    var _rects = _svg.append('g');

    function prim () {
        _background.attr({
            'width': _width,
            'height': _height
        }).style({
            'fill': 'black'
        });

        drawBorder();
        
    }

    function render () {

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

    prim.render = render;

    return prim;

}

function main () {
    var config = {
        'divId': '#maze'
    };

    var prim = primGenerator(config);

    prim();

}
