/*

  Copyright Kane Hadley 2016.

*/

function sliderGenerator(canvas) {
  'use strict';
  var image, mapping, emptyTile;
  var ctx = canvas.getContext('2d'),
    width = 0,
    height = 0,
    rows = 3,
    columns = 3,
    tileWidth = 0,
    tileHeight = 0;

  var shadowCanvas = document.createElement('canvas');
  var sCtx = shadowCanvas.getContext('2d');

  mapping = generateStandardMapping(rows, columns);
  emptyTile = [rows - 1, columns - 1];

  var game = function() {
    width = 0;
    height = 0;
  };

  game.width = function(newWidth) {
    if (newWidth) {
      width = newWidth;
      tileWidth = width / columns;
      canvas.width = width;
      shadowCanvas.width = width;
    }
    return newWidth ? this : width;
  };

  game.height = function(newHeight) {
    if (newHeight) {
      height = newHeight;
      tileHeight = height / rows;
      canvas.height = height;
      shadowCanvas.height = height;
    }
    return newHeight ? this : height;
  };

  game.load = function(inputImage) {
    image = inputImage;
    sCtx.drawImage(image, 0, 0, width, height);
  }

  game.render = function() {
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < columns; c++) {
        drawTile(shadowCanvas, ctx, mapping[r][c][0], mapping[r][c][1], r, c);
      }
    }

    // Fill in the empty tile as a white square
    ctx.fillStyle = 'white';
    ctx.fillRect(emptyTile[1]*tileWidth,
                 emptyTile[0]*tileHeight,
                 tileWidth,
                 tileHeight);

    drawGridLines(ctx);

    function drawGridLines(destination) {
      for (var c = 0; c < columns; c++) {
        destination.beginPath();
        destination.moveTo(c*tileWidth, 0);
        destination.lineTo(c*tileWidth, height);
        destination.stroke();

        destination.beginPath();
        destination.moveTo((c + 1)*tileWidth - 1, 0);
        destination.lineTo((c + 1)*tileWidth - 1, height);
        destination.stroke();
      }

      for (var r = 0; r < rows; r++) {
        destination.beginPath();
        destination.moveTo(0, r*tileHeight);
        destination.lineTo(width, r*tileHeight);
        destination.stroke();

        destination.beginPath();
        destination.moveTo(0, (r + 1)*tileHeight - 1);
        destination.lineTo(width, (r + 1)*tileHeight - 1);
        destination.stroke();
      }
    }

    /**
    *
    * Draws a sliced tile from the source to the destination. Automatically
    * takes into account tile width and tile height from the slider instance.
    *
    * @param {canvas} source
    *   A source canvas
    * @param {canvas context} destination
    *   A destination canvas context
    * @param {int} sr:
    *   Source tile row coordinate.
    * @param {int} sr:
    *   Source tile row coordinate.
    * @param {int} sc:
    *   Source tile column coordinate.
    * @param {int} dr:
    *   Destination tile row coordinate.
    * @param {int} dc:
    *   Destination tile column coordinate.
    */
    function drawTile(source, destination, sr, sc, dr, dc) {
      destination.drawImage(source,
        sc*tileWidth,
        sr*tileHeight,
        tileWidth,
        tileHeight,
        dc*tileWidth,
        dr*tileHeight,
        tileWidth,
        tileHeight);
      }
    };

    function generateStandardMapping(rows, columns) {
      var map = [];
      for (var r = 0; r < rows; r++) {
        var rArray = [];
        for (var c = 0; c < columns; c++) {
          rArray.push([r,c]);
        }
        map.push(rArray);
      }

      map[rows - 1][columns - 1] = [-1, -1];
      return map;
    }

    canvas.onclick = function (e) {
      var mouseX = e.offsetX,
        mouseY = e.offsetY;

      var row = parseInt(mouseY / tileHeight),
        column = parseInt(mouseX / tileWidth);

      // Swap clicked on tile with the empty tile
      mapping[emptyTile[0]][emptyTile[1]] = mapping[row][column];
      mapping[row][column] = [-1, -1];
      emptyTile = [row, column];

      game.render();

    };

    return game;
  }
