/**
 *  Copyright Kane Hadley 2016.
 */

var g;

document.addEventListener('DOMContentLoaded', function () {

  var enemySpawnRateSlider = document.getElementById('enemySpawnRateSlider'),
    enemySpawnRateTextfield = document.getElementById('enemySpawnRateTextfield'),
    enemyVelocitySlider = document.getElementById('enemyVelocitySlider'),
    enemyVelocityTextfield = document.getElementById('enemyVelocityTextfield'),
    projectileVelocitySlider = document.getElementById('projectileVelocitySlider'),
    projectileVelocityTextfield = document.getElementById('projectileVelocityTextfield'),
    playerVelocitySlider = document.getElementById('playerVelocitySlider'),
    playerVelocityTextfield = document.getElementById('playerVelocityTextfield');

  /**
   * Sliders to modify values while doing development testing.
   */
  enemySpawnRateSlider.oninput = function (e) {
    enemySpawnRateTextfield.value = enemySpawnRateSlider.value;
    g.development.updateSpawnRate(parseFloat(enemySpawnRateSlider.value));
  };

  enemySpawnRateTextfield.oninput = function (e) {
    enemySpawnRateSlider.value = enemySpawnRateTextfield.value;
    g.development.updateSpawnRate(parseFloat(enemySpawnRateTextfield.value));
  }

  enemyVelocitySlider.oninput = function (e) {
    enemyVelocityTextfield.value = enemyVelocitySlider.value;
    g.development.updateEnemyVelocity(parseFloat(enemyVelocitySlider.value));
  };

  enemyVelocityTextfield.oninput = function (e) {
    enemyVelocitySlider.value = enemyVelocityTextfield.value;
    g.development.updateEnemyVelocity(parseFloat(enemyVelocityTextfield.value));
  }

  projectileVelocitySlider.oninput = function (e) {
    projectileVelocityTextfield.value = projectileVelocitySlider.value;
    g.development.updateProjectileVelocity(parseFloat(projectileVelocitySlider.value));
  };

  projectileVelocityTextfield.oninput = function (e) {
    projectileVelocitySlider.value = projectileVelocityTextfield.value;
    g.development.updateProjectileVelocity(parseFloat(projectileVelocityTextfield.value));
  }

  projectileSpawnCountSlider.oninput = function (e) {
    projectileSpawnCountTextfield.value = projectileSpawnCountSlider.value;
    g.development.updateProjectileSpawnCount(parseFloat(projectileSpawnCountSlider.value));
  };

  projectileSpawnCountTextfield.oninput = function (e) {
    projectileSpawnCountSlider.value = projectileSpawnCountTextfield.value;
    g.development.updateProjectileSpawnCount(parseFloat(projectileSpawnCountTextfield.value));
  }

  projectileArcSlider.oninput = function (e) {
    projectileArcTextfield.value = projectileArcSlider.value;
    g.development.updateProjectileArc(parseFloat(projectileArcSlider.value));
  };

  projectileArcTextfield.oninput = function (e) {
    projectileArcSlider.value = projectileArcTextfield.value;
    g.development.updateProjectileArc(parseFloat(projectileArcTextfield.value));
  }

  playerVelocitySlider.oninput = function (e) {
    playerVelocityTextfield.value = playerVelocitySlider.value;
    g.development.updatePlayerVelocity(parseFloat(playerVelocitySlider.value));
  };

  playerVelocityTextfield.oninput = function (e) {
    playerVelocitySlider.value = playerVelocityTextfield.value;
    g.development.updatePlayerVelocity(parseFloat(playerVelocityTextfield.value));
  }

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
    ENTITY_SPAWN_RATE = 0.05,
    ENEMY_VELOCITY = 10,
    PROJECTILE_VELOCITY = 10,
    PLAYER_VELOCITY = 10,
    PROJECTILE_SPAWN_COUNT = 1,
    PROJECTILE_ARC = 180;

  var enemies = [];
  var projectiles = [];

  var player = {
    x: 100,
    y: 100
  }

  /**
   *  Constructor for the sidescrolling game.
   */
  var game = function () {
    width = 0;
    height = 0;
  }

  /**
   *  Starts the game loop sequence of:
   *    Player Input
   *    Update
   *    Render
   */
  game.start = function() {
    setInterval(function () {
      handleCollisions();
      updateEntities();
      spawnEnemies();
      game.render();
      console.log('Frame!');
    }, MILLISECONDS_PER_FRAME);

    /**
     *  Handles player movement and firing using the keyboard.
     */
    game.keyboard = function(key) {
      switch(key) {
        case 'ArrowUp':
          player.y -= PLAYER_VELOCITY;
          break;
        case 'ArrowDown':
          player.y += PLAYER_VELOCITY;
          break;
        case 'ArrowLeft':
          player.x -= PLAYER_VELOCITY;
          break;
        case 'ArrowRight':
          player.x += PLAYER_VELOCITY;
          break;
        case 'Space':
          spawnProjectiles();
          break;
      }
    };

    /**
     *  If a projectile fired from the player collides with a spawned enemy
     *  circle then mark it for deletion by setting "collision" to true.
     *  Also mark the projectile for deletion in the same way.
     */
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

    /**
     *  Check if there are any entities that need to be deleted. If so delete
     *  them. For everyone else move them according to their velocities.
     */
    function updateEntities() {
      var score,
        collidedEnemies = enemies.filter(function (e) {
          return true === e.collision;
        }).length;

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


      // Complete Hack for demo purposes. Do not do this.
      score = parseInt(document.getElementById('score').innerText);
      document.getElementById('score').innerText = score + collidedEnemies;

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

    /**
     *  Enemies are generated from the right side of the screen and move left.
     */
    function spawnEnemies() {
      if (Math.random() < ENTITY_SPAWN_RATE) {
        enemies.push(generateEnemy(width - 10,
                                     Math.random() * height));
      }
    }

    /**
     *  Projectiles are generated from the player's circle location and move
     *  to the right.
     */
    function spawnProjectiles() {
      projectiles = projectiles.concat(generateProjectiles(player));
    }

    /**
     *  Enemy generator function.
     */
    function generateEnemy(x, y) {
      return {
        x: x,
        y: y,
        dx: -ENEMY_VELOCITY,
        dy: 0,
        collision: false
      };
    }

    /**
     *   Generates one or more projectiles. Automatically generates the spacing
     *   in the arc between them.
     */
    function generateProjectiles(entity) {
      var arcDegrees = PROJECTILE_ARC / PROJECTILE_SPAWN_COUNT;

      var newProjectiles = []
      for (var count = 0; count < PROJECTILE_SPAWN_COUNT; count++) {
        var degrees = 90 - (((180 - PROJECTILE_ARC) / 2) + arcDegrees * count + (arcDegrees / 2));
        newProjectiles.push({
          x: entity.x,
          y: entity.y,
          dx: Math.cos(degrees * Math.PI / 180) * PROJECTILE_VELOCITY,
          dy: Math.sin(degrees * Math.PI / 180) * PROJECTILE_VELOCITY
        });
      }

      return newProjectiles;
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
    // Draw the background.
    ctx.fillStyle = 'lightblue';
    ctx.fillRect(0, 0, width, height);

    // Draw the player.
    ctx.beginPath();
    ctx.arc(player.x, player.y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = 'green';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'black';
    ctx.stroke();

    // Draw the enemy circles.
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

    // Draw the projectile circles.
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

  /**
   *  These are to expose private variables for testing and development.
   */
  game.development = {
    updateSpawnRate: function (newSpawnRate) {
      ENTITY_SPAWN_RATE = newSpawnRate;
    },
    updateEnemyVelocity: function (newEnemyVelocity) {
      ENEMY_VELOCITY = newEnemyVelocity;
    },
    updateProjectileVelocity: function (newProjectileVelocity) {
      PROJECTILE_VELOCITY = newProjectileVelocity;
    },
    updateProjectileSpawnCount: function (newProjectileSpawnCount) {
      PROJECTILE_SPAWN_COUNT = newProjectileSpawnCount;
    },
    updateProjectileArc: function (newProjectileArc) {
      PROJECTILE_ARC = newProjectileArc;
    },
    updatePlayerVelocity: function (newPlayerVelocity) {
      PLAYER_VELOCITY = newPlayerVelocity;
    }
  }

  return game;
}

window.addEventListener('keydown', function (e) {
  console.log('z');
  g.keyboard(e.code);

  g.render();
});
