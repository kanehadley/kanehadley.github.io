document.addEventListener('DOMContentLoaded', function () {
    var width = 960,
        height = 2200;

    var cluster = d3.layout.cluster()
        .size([height, width - 260]);

    var diagonal = d3.svg.diagonal()
        .projection(function (d) { return [d.y, d.x]; });

    var svg = d3.select('body').append('svg')
        .attr('width', width)
        .attr('height', height)
      .append('g')
        .attr('transform', 'translate(40,0)');

    d3.csv('js/naics/2-digit_2012_Codes.csv',
        function (d) {
            return {
                number: d['Seq. No.'],
                code: d['2012 NAICS US   Code'],
                title: d['2012 NAICS US Title']
            };
        },
        function (error, codes) {
            if (error) throw error;

            codes = codes.slice(1);
            var naics = {
            name: 'naics',
            children: d3.range(11,100).map(function (number) {
                return {
                    name: number.toString(),
                    children: codes.filter(function (d) { return d.code === number.toString();})
                        .map(function (d) {
                            return {
                                name: d.title,
                                size: 1000
                            };
                        })
                };
            })
            };
            var nodes = cluster.nodes(naics),
                links = cluster.links(nodes);

            var link = svg.selectAll('.link')
                .data(links)
              .enter().append('path')
                .attr('class', 'link')
                .attr('d', diagonal);

            var node = svg.selectAll('.node')
                .data(nodes)
              .enter().append('g')
                .attr('class', 'node')
                .attr('transform', function (d) { return 'translate(' + d.y + ',' + d.x + ')'; });

            node.append('circle')
                .attr('r', 4.5);

            node.append('text')
                .attr('dx', function (d) { return d.children ? -8 : 8; })
                .attr('dy', 3)
                .style('text-anchor', function (d) { return d.children ? 'end' : 'start'; })
                .text(function (d) { return d.name; });
        }
    );

    d3.select(self.frameElement).style('height', height + 'px');
});
