

function superformulaGenerator (a, b, m, n1, n2, n3) {

    return function (phi) {
        return {
            'x': x(phi),
            'y': y(phi)
        };
    };

    function r (phi) {
        return Math.pow(Math.pow(Math.abs(Math.cos(m * phi / 4) / a), n2) + Math.pow(Math.abs(Math.sin(m * phi / 4) / b), n3), n1);
    }

    function x (phi) {
        return r(phi) * Math.cos(phi);
    }

    function y (phi) {
        return r(phi) * Math.sin(phi);
    }
}

function renderSuperformula (svg, config) {
    var width = config.width;
    var height = config.height;

    var params = retrieveParameters();
    var a = params.a;
    var b = params.b;
    var m = params.m;
    var n1 = params.n1;
    var n2 = params.n2;
    var n3 = params.n3;
    var subdivisions = params.subdivisions;

    var superformula = superformulaGenerator(a, b, m, n1, n2, n3);

    var x = d3.scale.linear()
        .range([0, width])
        .domain([-1, 1]);

    var y = d3.scale.linear()
        .range([height, 0])
        .domain([-1, 1]);

    var points = d3.range(subdivisions).map(function (i) {
        var phi = i * (2 * Math.PI) / subdivisions;
        return superformula(phi);
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
    var n1 = parseFloat($('#n1-slider').val());
    var n2 = parseFloat($('#n2-slider').val());
    var n3 = parseFloat($('#n3-slider').val());
    var subdivisions = parseInt($('#subdivisions-slider').val());

    return {'a': a, 'b': b, 'm': m, 'n1': n1, 'n2': n2, 'n3': n3, 'subdivisions': subdivisions};
}

function updateSliders () {
    var a = parseFloat($('#a-text').val());
    var b = parseFloat($('#b-text').val());
    var m = parseFloat($('#m-text').val());
    var n1 = parseFloat($('#n1-text').val());
    var n2 = parseFloat($('#n2-text').val());
    var n3 = parseFloat($('#n3-text').val());
    var subdivisions = parseInt($('#subdivisions-text').val());
    $('#a-slider').val(a);
    $('#b-slider').val(b);
    $('#m-slider').val(m);
    $('#n1-slider').val(n1);
    $('#n2-slider').val(n2);
    $('#n3-slider').val(n3);
    $('#subdivisions-slider').val(subdivisions);
}

function updateTextInput () {
    var a = parseFloat($('#a-slider').val());
    var b = parseFloat($('#b-slider').val());
    var m = parseFloat($('#m-slider').val());
    var n1 = parseFloat($('#n1-slider').val());
    var n2 = parseFloat($('#n2-slider').val());
    var n3 = parseFloat($('#n3-slider').val());
    var subdivisions = parseInt($('#subdivisions-slider').val());
    $('#a-text').val(a);
    $('#b-text').val(b);
    $('#m-text').val(m);
    $('#n1-text').val(n1);
    $('#n2-text').val(n2);
    $('#n3-text').val(n3);
    $('#subdivisions-text').val(subdivisions);
}
