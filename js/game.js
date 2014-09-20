var game = new Phaser.Game(600, 600, Phaser.AUTO, 'phaser-stage', { preload: preload, create: create, update: update });

function preload() {
  game.load.image('arena', 'assets/arena.png');
  game.load.spritesheet('bear', 'assets/sprite_bearrage.png', 100, 100);
  game.load.image('chicken', 'assets/chicken.png');
  game.load.spritesheet('bear_chomp', 'assets/sprite_bearrage_chomp.png', 60, 25);
  game.load.image('creep', 'assets/creep.png');
}

var hero1, hero2
var key1 = {}, key2 = {};
var creeps, bullets, bulletTime = 0;
var fireRate = 100, nextFire = 0;

var p1special = 0;
var p2special = 0;

var bg;

function create() {

  bg = game.add.tileSprite(0, 0, 600, 600, 'arena');

  game.physics.startSystem(Phaser.Physics.ARCADE);

  // Configure keyboard
  key1 = {
    up: _addKey(Phaser.Keyboard.W),
    down: _addKey(Phaser.Keyboard.S),
    left: _addKey(Phaser.Keyboard.A),
    right: _addKey(Phaser.Keyboard.D),
    basic: _addKey(Phaser.Keyboard.SPACEBAR)
  };
  key2 = {
    up: _addKey(Phaser.Keyboard.UP),
    down: _addKey(Phaser.Keyboard.DOWN),
    left: _addKey(Phaser.Keyboard.LEFT),
    right: _addKey(Phaser.Keyboard.RIGHT),
    basic: _addKey(Phaser.Keyboard.ENTER)
  }

  // Make dem heroes
  hero1 = new Hero('bear', key1);
  hero2 = new Hero('chicken', key2);

  bullets = game.add.group();
  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;
  bullets.createMultiple(10, 'bear_chomp');
  bullets.setAll('anchor.x', 0.5);
  bullets.setAll('anchor.y', 1);
  bullets.setAll('checkWorldBounds', true);
  bullets.setAll('outOfBoundsKill', true);

  // add creeps
  creeps = game.add.group();
  _createCreeps(20);
  game.time.events.repeat(Phaser.Timer.SECOND * 10, 20, _resurrectCreep, this);
}

function update() {
  hero1.update();
  hero2.update();

  game.physics.arcade.collide(hero1, hero2);
  game.physics.arcade.collide(creeps, hero2);
  game.physics.arcade.collide(creeps, hero1);
  game.physics.arcade.collide(creeps, bullets, _attackCreepCallback, null, this);
}

// creep die collision
function _attackCreepCallback (_creeps, _bullets) {
  _creeps.kill();
  _bullets.kill();
  if (_bullets.player == 1) {
    p1special += 1;
    if (p1special >= 10) p1special = 10;
    updateBars();
  } else {
    p2special += 1;
    if (p2special >= 10) p2special = 10;
    updateBars();
  }
}

function _createCreeps(num) {
  for (var i = 0; i < num; i++) {
    var creep = creeps.create(_rnd(100, 700), _rnd(32, 700), 'creep');
    // creep.animations.add('spin', [0,1,2,3]);
    // creep.play('spin', 20, true);
    game.physics.enable(creep, Phaser.Physics.ARCADE);
    creep.body.velocity.x = _rnd(-100, 100);
    creep.body.velocity.y = _rnd(-100, 100);
    creep.body.angularVelocity = _rnd(-100, 100);
  }

  creeps.setAll('body.collideWorldBounds', true);
  creeps.setAll('body.bounce.x', 1);
  creeps.setAll('body.bounce.y', 1);
  creeps.setAll('body.minBounceVelocity', 0);
}

function _resurrectCreep() {
  var creep = creeps.getFirstDead(); //  Get a dead item

  if (creep) {
    creep.reset(game.world.randomX, game.world.randomY); //  And bring it back to life
    // creep.frame = _rnd(0, 36); 
    creep.body.velocity.x = _rnd(-100, 100);
    creep.body.velocity.y = _rnd(-100, 100);
    creep.body.angularVelocity = _rnd(-100, 100);
  }
}

// key bind helper
function _addKey(key) {
  return game.input.keyboard.addKey(key);
}

// random number helper
function _rnd(low, high) {
  return game.rnd.integerInRange(low, high);
}

// HERO MAKER
function Hero(type, key) {
  var sprite;

  switch (type) {
    // START BEAR
    case 'bear':
      sprite = game.add.sprite(50, 50, 'bear')
      sprite.anchor.setTo(0.5, 0.5);
      sprite.scale.setTo(0.75, 0.75);
      sprite.animations.add('bear_run', [1, 2, 3, 4, 5, 6, 7], 8, true);
      sprite.animations.add('bear_chomp', [9, 10, 11, 12, 13, 14, 15], 2, true);
      sprite.animations.add('bear_idle', [0], 10, true);
      sprite.chomp = function () {
        if (game.time.now > bulletTime) {
          //  Grab the first bullet we can from the pool
          bullet = bullets.getFirstExists(false);
          if (bullet) {
            bullet.reset(sprite.body.x + 16, sprite.body.y + 16);
            bullet.lifespan = 500;
            bullet.rotation = sprite.angle;
            bullet.player = 1;
            game.physics.arcade.velocityFromAngle(sprite.angle + 90, 500, bullet.body.velocity);
            bulletTime = game.time.now + 50;
          }
        }
      };
      sprite.update = function () {
        sprite.body.velocity.x = 0;
        sprite.body.velocity.y = 0;
        sprite.body.angularVelocity = 0;

        if (key.left.isDown) {
          sprite.body.angularVelocity = -200;
        } else if (key.right.isDown) {
          sprite.body.angularVelocity = 200;
        }

        if (key.up.isDown) {
          sprite.animations.play('bear_run');
          game.physics.arcade.velocityFromAngle(sprite.angle + 90, 300, sprite.body.velocity);
        } else if (key.down.isDown) {
          sprite.animations.play('bear_run');
          game.physics.arcade.velocityFromAngle(sprite.angle + 90, -200, sprite.body.velocity);
        }

        if (key.basic.isDown) {
          sprite.animations.play('bear_chomp');
        }

        // fast chomp
        // if (key.basic.isDown) { sprite.chomp(); }
        // slow chomp
        key.basic.onDown.add(sprite.chomp, this);
      }
      break;
    // END BEAR
    // START DEFAULT (CHICKEN)
    default:
      sprite = game.add.sprite(550, 550, 'chicken');
      sprite.anchor.setTo(0.5, 0.5);
      sprite.rotation = 180;
      sprite.chomp = function () {
        if (game.time.now > bulletTime) {
          //  Grab the first bullet we can from the pool
          bullet = bullets.getFirstExists(false);
          if (bullet) {
            bullet.reset(sprite.body.x + 16, sprite.body.y + 16);
            bullet.lifespan = 150;
            bullet.rotation = sprite.angle;
            bullet.player = 2;
            game.physics.arcade.velocityFromAngle(sprite.angle + 90, 800, bullet.body.velocity);
            bulletTime = game.time.now + 50;
          }
        }
      };
      sprite.update = function () {
        sprite.body.velocity.x = 0;
        sprite.body.velocity.y = 0;
        sprite.body.angularVelocity = 0;

        if (key.left.isDown) {
          sprite.body.angularVelocity = -200;
        } else if (key.right.isDown) {
          sprite.body.angularVelocity = 200;
        }

        if (key.up.isDown) {
          game.physics.arcade.velocityFromAngle(sprite.angle + 90, 300, sprite.body.velocity);
        } else if (key.down.isDown) {
          game.physics.arcade.velocityFromAngle(sprite.angle + 90, -200, sprite.body.velocity);
        }

        // fast chomp
        // if (key.basic.isDown) { sprite.chomp(); }
        // slow chomp
        key.basic.onDown.add(sprite.chomp, this);
      }
    // END DEFAULT
  }
  game.physics.enable(sprite, Phaser.Physics.ARCADE);
  sprite.body.collideWorldBounds = true;

  return sprite;

}

function updateBars() {
  $('.barContainer.p1 .barFill').height(600/10*p1special);
  $('.barContainer.p2 .barFill').height(600/10*p2special);
  if (p1special == 10) {
    $('.barContainer.p1').addClass('glow');
  } else {
    $('.barContainer.p1').removeClass('glow');
  }
  if (p2special == 10) {
    $('.barContainer.p2').addClass('glow');
  } else {
    $('.barContainer.p2').removeClass('glow');
  }
}
