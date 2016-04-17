var g;

document.addEventListener('DOMContentLoaded', function () {
  g = sidescrollerGenerator(document.getElementById('game'));

  g.width(800).height(200);
  g.start();
});

function sidescrollerGenerator(canvas) {
  'use strict';

  var ctx = canvas.getContext('2d'),
    width = 0,
    height = 0,
    MILLISECONDS_PER_FRAME = 1000 / 10;

  var entities = [];

  var player = {
    x: 100,
    y: 100
  }

  var game = function () {
    width = 0;
    height = 0;
  }

  game.start = function() {
    setInterval(function () {
      updateEntities();
      spawnEntities();
      game.render();
      console.log('Frame!');
    }, MILLISECONDS_PER_FRAME);

    function updateEntities() {
      entities = entities.map(function (e) {
        return {
          x: e.x + e.dx,
          y: e.y + e.dy,
          dx: e.dx,
          dy: e.dy
        };
      }).filter(function (e) {
        return e.x > 0;
      });
    }

    function spawnEntities() {
      if (Math.random() < 0.3) {
        entities.push(generateEntity(width - 10,
                                     Math.random() * height));
      }
    }

    function generateEntity(x, y) {
      return {
        x: x,
        y: y,
        dx: -10,
        dy: 0
      };
    }
  }

  game.width = function(newWidth) {
    if (newWidth) {
      width = newWidth;
      canvas.width = newWidth;
    }
    return newWidth ? this : width;
  }

  game.height = function(newHeight) {
    if (newHeight) {
      height = newHeight;
      canvas.height = newHeight;
    }
    return newHeight ? this : height;
  }

  game.keyboard = function(key) {
    switch(key) {
      case 'ArrowUp':
        player.y -= 10;
        break;
      case 'ArrowDown':
        player.y += 10;
        break;
      case 'ArrowLeft':
        player.x -= 10;
        break;
      case 'ArrowRight':
        player.x += 10;
        break;
    }
  };

  game.render = function() {
    // Draw the background
    ctx.fillStyle = 'lightblue';
    ctx.fillRect(0, 0, width, height);

    // Draw the player
    ctx.beginPath();
    ctx.arc(player.x, player.y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = 'green';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'black';
    ctx.stroke();

    for (var entityIndex in entities) {
      var entity = entities[entityIndex];
      ctx.beginPath();
      ctx.arc(entity.x, entity.y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'black';
      ctx.stroke();
    }

    // Draw the border
    ctx.rect(0, 0, width - 1, height - 1);
    ctx.stroke();
  }

  return game;
}

window.addEventListener('keydown', function (e) {
  console.log('z');
  g.keyboard(e.code);

  g.render();
});
