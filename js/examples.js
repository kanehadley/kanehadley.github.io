var automata = (function (automata) {

    automata.initializeGlider = function () {
        automata.clear();
        automata.xy(5, 5, 1)
                .xy(5, 7, 1)
                .xy(6, 7, 1)
                .xy(6, 6, 1)
                .xy(7, 6, 1);
        automata.update();
    };

    automata.initializeOscillators = function () {
        automata.clear();
        automata.xy(5,5,1)
                .xy(5,6,1)
                .xy(5,7,1);

        automata.xy(10,6,1)
                .xy(11,6,1)
                .xy(12,6,1)
                .xy(9,7,1)
                .xy(10,7,1)
                .xy(11,7,1);

        automata.xy(5,10,1)
                .xy(6,10,1)
                .xy(5,11,1)
                .xy(8,12,1)
                .xy(8,13,1)
                .xy(7,13,1);

        automata.update();
    };


    automata.initializePulsars = function () {

        d3.text('js/pulsar.txt', 'text/plain', function (error, text) {
            automata.clear();

            JSON.parse(text)
                .map(function (square) {
                    automata.xy(square[0]+10, square[1]+10, 1);
                });

            automata.update();
        });

    };

    
    automata.initializeGliderGun = function () {

    };


    automata.initializeStillLifes = function () {

    };

    return automata;

}) (automata || {});
