// Data found here http://www.census.gov/govs/school/
// gotten to from here: http://catalog.data.gov/dataset/annual-survey-of-school-system-finances

function main () {
    var oReq = new XMLHttpRequest();

    oReq.open('GET', 'educationData/elsec13t.csv');

    oReq.onload = function () {
        var status = oReq.status;
        var response = oReq.responseText;
        population(JSON.parse(response));
    };

    oReq.error = function () {

    };

    //oReq.send();

    d3.csv('educationData/elsec13t.csv', type, function (error, data) {
        education(data);
    });

    function type (d) {
        var newData = {};

        Object.keys(d).forEach(function (field) {
            newData[fieldMap(field)] = valueMap(field, d[field]);
        });
        return newData;
    }

    function fieldMap (field) {
        var fields = {
            'TOTALREV': 'total_revenue',
            'NAME': 'name'
        };

        return fields[field] ? fields[field] : field;
    }

    function valueMap (field, value) {
        if ('TOTALREV' === field) {
            return +value;
        }
        return value;
    }

}

function education (data) {
    var div = d3.select('#education-bar-chart');

    var chart = new BarChart(div.node());

    chart.render(generateEducationData(data));
}

function generateEducationData (data) {
    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    return alphabet.split('').map(function (letter) {
        return {
            'label': letter,
            'value': data.filter(function (d) {
                return letter === d.name[0];
            }).length
        };
    });
}

function filterByField (data, field, value) {
    return data.filter(function (d) { return value === d[field]; });
}

function filterByDomain (data, domain) {
    return filterByField(data, 'construction_domain', domain);
}

function BarChart (div) {
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

        var bars = _viewer.selectAll('rect').
            data(data);

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
