function main () {
    var oReq = new XMLHttpRequest();

    oReq.open('GET', 'populationData/NST_EST2014_ALLDATA.csv');

    oReq.onload = function () {
        var status = oReq.status;
        var response = oReq.responseText;
        population(JSON.parse(response));
    };

    oReq.error = function () {

    };

    //oReq.send();

    d3.csv('populationData/NST_EST2014_ALLDATA.csv', type, function (error, data) {
        population(data);
    });

    function type (d) {
        d.BIRTHS2010 = +d.BIRTHS2010;
        return d;
    }

}

function population (data) {
    var div = d3.select('#population');
}

function filterByField (data, field, value) {
    return data.filter(function (d) { return value === d[field]; });
}

function filterByDomain (data, domain) {
    return filterByField(data, 'construction_domain', domain);
}
