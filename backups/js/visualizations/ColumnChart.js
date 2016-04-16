function ColumnChart (div) {
    var width = 1000;
    var height = 500;
    var _svg = d3.select(div).append('svg')
        .attr({
            'width': width,
            'height': height
        });

    var _yAxis = _svg.append('g')
        .attr('transform', 'translate(' + (width * 0.2) + ',0)')
        .attr('class', 'axis');
    var _xAxis = _svg.append('g')
        .attr('transform', 'translate(' + (width * 0.2) + ',' + (height * 0.8) + ')')
        .attr('class', 'axis');
    var _viewer = _svg.append('g')
        .attr('transform', 'translate(' + (width * 0.2) + ',0)');

    function render (data) {
        var barWidth = 10;

        var y = d3.scale.log()
            .range([height * 0.8, 0])
            .domain([1, maxValue(data)]);

        var x = d3.scale.ordinal()
            .domain(getLabels(data))
            .rangeBands([0, width * 0.8]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom');

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left');

        _xAxis.call(xAxis);
        _yAxis.call(yAxis);

        var bars = _viewer.selectAll('rect')
            .data(data);

        bars.exit().remove();

        bars.enter().append('rect');

        bars.attr({
            'class': 'bar',
            'width': barWidth,
            'height': function (d) { return y(d.value); },
            'x': function (d) { return x(d.label) + (x.rangeBand() / 2) - (barWidth / 2 ); },
            'y': function (d) { return (height * 0.8) - y(d.value); }
        });

    }

    function getLabels (data) {
        return data.map(function (d) {
            return d.label;
        });
    }

    function maxValue (data) {
        return d3.max(data.map(function (d) {
            return d.value;
        }));
    }

    function minValue (data) {
        return d3.min(data.map(function (d) {
            return d.value;
        }));
    }

    this.render = render;

    return this;
}
