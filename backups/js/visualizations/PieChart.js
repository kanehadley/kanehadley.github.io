function PieChart (div) {
    var _svg = d3.select(div).append('svg');

    function render (data, config) {
        config = config || {};
        _svg.attr({
            'width': (config.radius || 100) * 2,
            'height': (config.radius || 100) * 2
        });

        var pieFunction = d3.layout.pie();

        var arcFunction = d3.svg.arc();

        var arcData = generateArcData(data, config.radius || 100);

        var paths = _svg.selectAll('path')
            .data(pieFunction(arcData));

        paths.exit().remove();
        paths.enter().append('path');
        paths.each(function (d) { d.outerRadius = 100; })
            .attr({
                'd': arcFunction,
            });

    }

    function generateArcData (data, radius) {

        return data.map(function (d) { return d.value; });
    }

    function totalValue (data) {
        return d3.sum(data.map(function (datum) {
            return datum.value;
        }));
    }

    function proportionData (data) {
        var total = totalValue(data);
        return data.map(function (datum) {
            return {
                'label': datum.label,
                'value': datum.value / total,
                'color': datum.color
            };
        });
    }

    this.render = render;

    return this;
}
