var DOCUMENT_YEARS = [
        '2003',
        '2004',
        '2005',
        '2006',
        '2007',
        '2008',
        '2009',
        '2010',
        '2011',
        '2012',
        '2013',
        '2014',
        '2015'
    ];

var DOCUMENT_MONTHS = [
        '01',
        '02',
        '03',
        '04',
        '05',
        '06',
        '07',
        '08',
        '09',
        '10',
        '11',
        '12',
    ];

function main () {
    var oReq = new XMLHttpRequest();

    oReq.open('GET', 'data/pr200306.json');

    oReq.onload = function () {
        var status = oReq.status;
        var response = oReq.responseText;
        construction(JSON.parse(response));
    };

    oReq.error = function () {

    };

    oReq.send();
}

function construction (data) {
    var div = d3.select('#construction');
}

function filterByField (data, field, value) {
    return data.filter(function (d) { return value === d[field]; });
}

function filterByDomain (data, domain) {
    return filterByField(data, 'construction_domain', domain);
}
