function fibonacciGenerator () {

    var _prev = 0;
    var _current = 1;
    var _index = 1;

    function fibonacci () {

    }

    // Moves forward one number in the sequence and increases the index
    fibonacci.next = function (count) {
        if (!arguments.length) count = 1;
        for (var i = 0; i < count; i++) _next();
        return fibonacci;
    };

    // Moves forward one number in the sequence and increases the index
    fibonacci.previous = function (count) {
        if (!arguments.length) count = 1;
        for (var i = 0; i < count; i++) _previous();
        return fibonacci;
    };

    fibonacci.index = function () { return _index; };

    fibonacci.value = function () { return _current; };

    return fibonacci;

    function _next () {
        var temp = _current;
        _current = _current + _prev;
        _prev = temp;
        _index += 1;
    }

    function _previous () {
        var temp = _prev;
        _prev = _current - _prev;
        _current = temp;
        _index -= 1;
    }
}

if (typeof module === 'object' && module.exports) module.exports = fibonacciGenerator;
