document.addEventListener('DOMContentLoaded', function () {
    art();
});

function art () {
    'use strict';

    var eisel = document.getElementById('eisel');
    var ctx = eisel.getContext('2d');

    var vectors = [];
    var FPS = 30;

    function setup () {
        $('#eisel').click(function (event) {
            var x = event.offsetX;
            var y = event.offsetY;
            //ctx.fillStyle = '#FF0000';
            //ctx.fillRect(x, y, 10, 10);
            vectors.push({
                'x': x,
                'y': y,
                'dx': 1,
                'dy': 0
            });
        });

        setInterval(function () {
            var spawns = [];
            vectors = vectors.map(function (vector) {
                var imageData = ctx.createImageData(1, 1);
                var data = imageData.data;
                data[0] = 255;
                data[1] = 0;
                data[2] = 0;
                data[3] = 255;

                var x = vector.x;
                var y = vector.y;
                var dx = vector.dx;
                var dy = vector.dy;

                ctx.putImageData(imageData, x, y);

                if (Math.random() < 0.01) {
                    spawns.push({
                        'x': x,
                        'y': y,
                        //'dx': -dx * parseInt((Math.random() * 3) - 1),
                        //'dy': -dy * parseInt((Math.random() * 3) - 1),
                        'dx': Math.floor((Math.random() * 3) - 1),
                        'dy': Math.floor((Math.random() * 3) - 1),
                    });
                }


                return {
                    'x': x + dx,
                    'y': y + dy,
                    'dx': dx,
                    'dy': dy
                };
            });
            vectors = vectors.concat(spawns);
        }, 1000 / FPS);

    }

    setup();
}
