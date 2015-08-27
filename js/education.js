// Data found here http://www.census.gov/govs/school/
// gotten to from here: http://catalog.data.gov/dataset/annual-survey-of-school-system-finances

function main () {

    var div = d3.select('#education-bar-chart');

    var chart = new ColumnChart(div.node());

    chart.render(generateColumnChartData());

    var div2 = d3.select('#education-scatter-plot');

    var scatter = new ScatterPlot(div2.node());

    var meanSlider = $('#mean');
    var varianceSlider = $('#variance');

    //meanSlider
    $('#mean')
        .on('change mousemove', function () {
            scatter.render(generateScatterPlotData(parseFloat(meanSlider.val()), parseFloat(varianceSlider.val())));
        });

    varianceSlider
        .on('change mousemove', function () {
            scatter.render(generateScatterPlotData(parseFloat(meanSlider.val()), parseFloat(varianceSlider.val())));
        });

    scatter.render(generateScatterPlotData(0.5, 0.5));
}

function generateScatterPlotData (mean, variance) {

    var f = d3.random.normal(mean, variance);
    return d3.range(100).map(function (d) {
        return {
            'x': f(),
            'y': f()
        };
    });
}

function generateColumnChartData () {
    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    return alphabet.split('').map(function (letter) {
        return {
            'label': letter,
            'value': Math.random() * 100
        };
    });
}

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

function PieChart (div) {

}
