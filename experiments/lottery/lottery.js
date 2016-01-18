document.addEventListener('DOMContentLoaded', function () {
    $('#go').click(win);
});

function win () {
    var first = $('#first').val(),
        second = $('#second').val(),
        third = $('#third').val(),
        fourth = $('#fourth').val(),
        fifth = $('#fifth').val(),
        sixth = $('#sixth').val();

    if (isNumeric(first) &&
        isNumeric(second) &&
        isNumeric(third) &&
        isNumeric(fourth) &&
        isNumeric(fifth) &&
        isNumeric(sixth)) {

        var ans = parseFloat(first) *
                parseFloat(second) *
                parseFloat(third) *
                parseFloat(fourth) *
                parseFloat(fifth) *
                parseFloat(sixth) / (69 * 68 * 67 * 66 * 65 * 26);

        ans = 1 / (69 * 68 * 67 * 66 * 65 * 26);

        $('#answer').val((ans * 100).toFixed(10) + '%');
    }
}

function isNumeric(string) {
    return !isNaN(string);
}

function factorial(n) {
    var total = 1;
    var count = 2;

    while (count <= n) {
        total *= count;
        count += 1;
    }

    return total;
}
