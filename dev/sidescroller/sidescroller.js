var g;

document.addEventListener('DOMContentLoaded', function () {
  g = sidescrollerGenerator(document.getElementById('game'));

  g.width(800).height(200).render();
});

function sidescrollerGenerator(canvas) {
  'use strict';

  var ctx = canvas.getContext('2d'),
    width = 0,
    height = 0;

  var entities = [];

  var player = {
    x: 100,
    y: 100
  }

  var game = function () {
    width = 0;
    height = 0;
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
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    ctx.beginPath();

    ctx.arc(player.x, player.y, 10, 0, 2 * Math.PI);

    ctx.fillStyle = 'green';
    ctx.fill();

    ctx.lineWidth = 5;
    ctx.strokeStyle = 'black';
    ctx.stroke();

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
