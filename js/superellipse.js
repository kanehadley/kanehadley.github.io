

function superellipseGenerator (a, b, m, n) {

    return function (theta) {
        return {
            'x': x(theta),
            'y': y(theta)
        };
    };

    function x (theta) {
        return Math.sign(Math.cos(theta)) * a * Math.pow(Math.abs(Math.cos(theta)), 2 / m);
    }

    function y (theta) {
        return Math.sign(Math.sin(theta)) * b * Math.pow(Math.abs(Math.sin(theta)), 2 / n);
    }


}

function renderSuperellipse (svg, config) {
    var width = config.width;
    var height = config.height;

    var params = retrieveParameters();
    var a = params.a;
    var b = params.b;
    var m = params.m;
    var n = params.n;

    var superellipse = superellipseGenerator(a, b, m, n);

    var x = d3.scale.linear()
        .range([0, width])
        .domain([-1, 1]);

    var y = d3.scale.linear()
        .range([height, 0])
        .domain([-1, 1]);

    var subdivisions = 100;

    var points = d3.range(subdivisions).map(function (i) {
        var theta = i * (2 * Math.PI) / subdivisions;
        return superellipse(theta);
    });

    var line = d3.svg.line()
        .x(function (d) { return x(d.x); })
        .y(function (d) { return y(d.y); })
        .interpolate('linear');

    var path = svg.select('path')
        .attr('d', function () { return line(points) + 'Z'; })
        .style({
            'stroke': 'black',
            'fill': 'none'
        });

}

function retrieveParameters () {
    var a = parseFloat($('#a-slider').val());
    var b = parseFloat($('#b-slider').val());
    var m = parseFloat($('#m-slider').val());
    var n = parseFloat($('#n-slider').val());

    return {'a': a, 'b': b, 'm': m, 'n': n};
}

function updateSliders () {
    var a = parseFloat($('#a-text').val());
    var b = parseFloat($('#b-text').val());
    var m = parseFloat($('#m-text').val());
    var n = parseFloat($('#n-text').val());
    $('#a-slider').val(a);
    $('#b-slider').val(b);
    $('#m-slider').val(m);
    $('#n-slider').val(n);
}

function updateTextInput () {
    var a = parseFloat($('#a-slider').val());
    var b = parseFloat($('#b-slider').val());
    var m = parseFloat($('#m-slider').val());
    var n = parseFloat($('#n-slider').val());
    $('#a-text').val(a);
    $('#b-text').val(b);
    $('#m-text').val(m);
    $('#n-text').val(n);
}
