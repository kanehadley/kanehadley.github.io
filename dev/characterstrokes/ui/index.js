var canvas, ctx;
var drawing = false;

document.addEventListener('DOMContentLoaded', function () {
    canvas = document.getElementById('sketchpad');
    ctx = canvas.getContext('2d');

    canvas.onmousedown = function (e) {
        drawing = true;
    };

    canvas.onmouseup = function (e) {
        drawing = false;
    };

    canvas.onmousemove = function (e) {
        var mouseX = e.offsetX;
        var mouseY = e.offsetY;

        if (drawing) {
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, 4, 0, 2 * Math.PI);
            ctx.fillStyle = 'black';
            ctx.fill();
        }
    };
});
