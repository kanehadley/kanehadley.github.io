function ScatterPlot (div) {
    var width = 1000;
    var height = 500;

    var _svg = d3.select(div).append('svg')
        .attr({
            'width': width,
            'height': height
        });

    var _yAxis = _svg.append('g')
        .attr({
            'transform': 'translate(' + (width * 0.2) + ',0)',
            'class': 'axis'
        });

    var _xAxis = _svg.append('g')
        .attr({
            'transform': 'translate(' + (width * 0.2) + ' ,' + (height * 0.8) + ')',
            'class': 'axis'
        });
    var _viewer = _svg.append('g')
        .attr('transform', 'translate(' + (width * 0.2) + ',0)');
    var _border = _svg.append('rect')
        .attr({
            'transform': 'translate(' + (width * 0.2) + ',0)',
            'width': width * 0.8,
            'height': height * 0.8
        })
        .style({
            'fill': 'none',
            'stroke': 'black'
        });

    function render (data) {
        var y = d3.scale.linear()
            .range([height * 0.8, 0])
            .domain([minYValue(data), maxYValue(data)]);

        var x = d3.scale.linear()
            .range([0, width * 0.8])
            .domain([minXValue(data), maxXValue(data)]);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left');

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom');

        _yAxis.call(yAxis);
        _xAxis.call(xAxis);

        var points = _viewer.selectAll('circle')
            .data(data);

        points.exit().remove();

        points.enter().append('circle');

        points.attr({
            'class': 'point',
            'cx': function (d) { return x(d.x); },
            'cy': function (d) { return y(d.y); },
            'r': 3
        });
    }

    function maxXValue (data) {
        return d3.max(data.map(function (d) {
            return d.x;
        }));
    }

    function minXValue (data) {
        return d3.min(data.map(function (d) {
            return d.x;
        }));
    }

    function maxYValue (data) {
        return d3.max(data.map(function (d) {
            return d.y;
        }));
    }

    function minYValue (data) {
        return d3.min(data.map(function (d) {
            return d.y;
        }));
    }

    this.render = render;
}
