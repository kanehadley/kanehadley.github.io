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
    height = 0;

  var MILLISECONDS_PER_FRAME = 1000 / 10,
    ENTITY_SPAWN_RATE = 0.05;

  var enemies = [];
  var projectiles = [];

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
      handleCollisions();
      updateEntities();
      spawnEnemies();
      game.render();
      console.log('Frame!');
    }, MILLISECONDS_PER_FRAME);


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
        case 'Space':
        spawnProjectiles();
        break;
      }
    };

    function handleCollisions() {
      enemies = enemies.map(function (e) {
        var distances = projectiles.map(function (p) {
          return Math.sqrt(Math.pow(p.x - e.x, 2) + Math.pow(p.y - e.y, 2));
        }).filter(function (d) {
          return d <= (10 + 3);
        });
        return {
          x: e.x,
          y: e.y,
          dx: e.dx,
          dy: e.dy,
          collision: distances.length > 0 ? true : false
        }
      });

      projectiles = projectiles.map(function (p) {
        var distances = enemies.map(function (e) {
          return Math.sqrt(Math.pow(p.x - e.x, 2) + Math.pow(p.y - e.y, 2));
        }).filter(function (d) {
          return d <= (10 + 3);
        });
        return {
          x: p.x,
          y: p.y,
          dx: p.dx,
          dy: p.dy,
          collision: distances.length > 0 ? true : false
        }
      });
    }

    function updateEntities() {
      enemies = enemies.map(function (e) {
        return {
          x: e.x + e.dx,
          y: e.y + e.dy,
          dx: e.dx,
          dy: e.dy,
          collision: e.collision
        };
      }).filter(function (e) {
        return e.x > 0 && false === e.collision;
      });

      projectiles = projectiles.map(function (p) {
        return {
          x: p.x + p.dx,
          y: p.y + p.dy,
          dx: p.dx,
          dy: p.dy,
          collision: p.collision
        };
      }).filter(function (p) {
        return p.x < width && false === p.collision;
      });
    }

    function spawnEnemies() {
      if (Math.random() < ENTITY_SPAWN_RATE) {
        enemies.push(generateEnemy(width - 10,
                                     Math.random() * height));
      }
    }

    function spawnProjectiles() {
      projectiles.push(generateProjectile(player));
    }

    function generateEnemy(x, y) {
      return {
        x: x,
        y: y,
        dx: -10,
        dy: 0,
        collision: false
      };
    }

    function generateProjectile(entity) {
      return {
        x: entity.x,
        y: entity.y,
        dx: 10,
        dy: 0,
        collision: false
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

    for (var entityIndex in enemies) {
      var entity = enemies[entityIndex];
      ctx.beginPath();
      ctx.arc(entity.x, entity.y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'black';
      ctx.stroke();
    }

    for (var projectileIndex in projectiles) {
      var projectile = projectiles[projectileIndex];
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = 'yellow';
      ctx.fill();
      ctx.lineWidth = 2;
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
