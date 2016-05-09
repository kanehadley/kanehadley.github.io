var canvas, ctx, W, b;
var drawing = false;

document.addEventListener('DOMContentLoaded', function () {
    $.ajax({
        "url": "weights.json",
        "success": function (data, textStatus, jqXHR) {
            canvas = document.getElementById('sketchpad');
            ctx = canvas.getContext('2d');

            W = reshape(data.W, data.W_rows, data.W_columns);
            b = data.b;

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
        }
    });
});

function generateDownsampledImage(sourceCanvas) {
    var downsampledCanvas = document.createElement('canvas');
    var downsampledContext = downsampledCanvas.getContext('2d');

    downsampledContext.drawImage(canvas, 0, 0, 500, 500, 0, 0, 28, 28);

    return [rgbToGrayscale(downsampledContext.getImageData(0, 0, 28, 28).data).map(function (d) { return d / 255; })];
}

function rgbToGrayscale(data) {
    var r, g, b;
    var index = 0;
    var newData = [];

    while (index + 3 < data.length) {
        //r = data[index] * 0.2989;
        //g = data[index + 1] * 0.5870;
        //b = data[index + 2] * 0.1140;
        //newData.push(r + g + b);
        newData.push(data[index + 3]);
        index += 4;
    }

    return newData;
}

function reshape(data, rows, columns) {
    arr = [];
    for (var r = 0; r < rows; r++) {
        line = [];
        for (var c = 0; c < columns; c++) {
            line.push(data[r * columns + c]);
        }
        arr.push(line);
    }

    return arr;
}

function matrixMultiply(A, B) {
    var total = 0;
    var C = [];

    for (var rA = 0; rA < A.length; rA++) {
        line = [];
        for (var cB = 0; cB < B[0].length; cB++) {
            total = 0;
            for (var cA = 0; cA < A[0].length; cA++) {
                total += A[rA][cA] * B[cA][cB];
            }
            line.push(total);
        }
        C.push(line);
    }

    return C;
}

function matrixAdd(A, B) {
    var C = [];

    for (var rA = 0; rA < A.length; rA++) {
        line = [];
        for (var cA = 0; cA < A[0].length; cA++) {
            line.push(A[rA][cA] + B[rA][cA]);
        }
        C.push(line);
    }

    return C;
}

function classify (W, b, X) {
    return argmax(softmax(matrixAdd(matrixMultiply(X, W), [b])));
}

function softmax (X) {
    var total = 0;
    var softmaxedLine = 0;
    var B = [];

    for (var rX = 0; rX < X.length; rX++) {
        line = [];
        for (var cX = 0; cX < X[0].length; cX++) {
            line.push(Math.exp(X[rX][cX]));
        }

        total = line.reduce(function (a, b) { return a + b; }, 0);
        softmaxedLine = line.map(function (d) { return d / total; });
        B.push(softmaxedLine);
    }

    return B;
}

function argmax (X) {
    var Y = [];
    var lineMax = 0;
    var maxIndex = 0;

    for (var rX = 0; rX < X.length; rX++) {
        lineMax = X[rX][0];
        maxIndex = 0;
        for (var cX = 0; cX < X[0].length; cX++) {
            if (X[rX][cX] > lineMax) {
                lineMax = X[rX][cX];
                maxIndex = cX;
            }
        }
        Y.push(maxIndex);
    }

    return Y;
}
