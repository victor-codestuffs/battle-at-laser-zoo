var game = new Phaser.Game(600, 600, Phaser.AUTO, 'phaser-stage', { preload: preload, create: create, update: update });

WebFontConfig = {

  //  We set a 1 second delay before calling 'createText'.
  //  For some reason if we don't the browser cannot render the text the first time it's created.
  active: function() { game.time.events.add(Phaser.Timer.SECOND, _showIntro, this); },
  google: {
    families: ['Roboto']
  }

};

function preload() {
  game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
  game.load.image('arena', 'assets/arena.png');
  game.load.image('chicken', 'assets/chicken.png');
  game.load.image('fireball', 'assets/fireball.png');
  game.load.spritesheet('bear', 'assets/sprite_bearrage.png', 100, 100);
  game.load.spritesheet('bear_bullets', 'assets/sprite_bearrage_chomp.png', 60, 25);
  game.load.spritesheet('bear_ulti', 'assets/sprite_bearrage_ulti.png', 120, 92);
  game.load.spritesheet('topcat', 'assets/sprite_topcat.png', 100, 100);
  game.load.spritesheet('topcat_bullets', 'assets/sprite_topcat_chomp.png', 30, 54);
  game.load.spritesheet('topcat_ulti', 'assets/sprite_topcat_ulti.png', 120, 100);
  game.load.image('creep', 'assets/creep.png');
  game.load.audio('laser1', 'assets/audio/laser-1.wav');
  game.load.audio('laser2', 'assets/audio/laser-2.wav');
  game.load.audio('hurt1', 'assets/audio/hurt-1.wav');
  game.load.audio('hurt2', 'assets/audio/hurt-2.wav');
  game.load.audio('explosion1', 'assets/audio/explosion-1.wav');
  game.load.audio('explosion2', 'assets/audio/explosion-2.wav');
  game.load.audio('letthemfight', 'assets/audio/letthemfight.mp3');
}

var hero1, hero2;
var key1 = {}, key2 = {};
var creeps, bullets, bulletTime = 0;
var fireRate = 100, nextFire = 0;
var bg;
var SPECIAL_LIMIT = 3;
var CREEP_LIMIT = 30;
var CREEP_REGEN_TIME = 5;
var openText, winner, stateText;

function create() {

  bg = game.add.tileSprite(0, 0, 600, 600, 'arena');
  laserfx1 = game.add.audio('laser1');
  laserfx2 = game.add.audio('laser2');
  hurtfx1 = game.add.audio('hurt1');
  hurtfx2 = game.add.audio('hurt2');
  explosionfx1 = game.add.audio('explosion1');
  explosionfx2 = game.add.audio('explosion2');
  letthemfightfx = game.add.audio('letthemfight');

  game.physics.startSystem(Phaser.Physics.ARCADE);

  // Configure keyboard
  key1 = {
    up: _addKey(Phaser.Keyboard.W),
    down: _addKey(Phaser.Keyboard.S),
    left: _addKey(Phaser.Keyboard.A),
    right: _addKey(Phaser.Keyboard.D),
    basic: _addKey(Phaser.Keyboard.SPACEBAR),
    special: _addKey(Phaser.Keyboard.V)
  };
  key2 = {
    up: _addKey(Phaser.Keyboard.UP),
    down: _addKey(Phaser.Keyboard.DOWN),
    left: _addKey(Phaser.Keyboard.LEFT),
    right: _addKey(Phaser.Keyboard.RIGHT),
    basic: _addKey(Phaser.Keyboard.ENTER),
    special: _addKey(Phaser.Keyboard.SHIFT)
  }

  // Make dem heroes
  hero1 = new Hero('bear', key1);
  hero2 = new Hero('topcat', key2);

  // add creeps
  creeps = game.add.group();
  _createCreeps(CREEP_LIMIT);
  game.time.events.repeat(Phaser.Timer.SECOND * CREEP_REGEN_TIME, CREEP_LIMIT, _resurrectCreep, this);

  // text
  stateText = game.add.text(game.world.centerX,game.world.centerY, "You're winner\nClick to restart", { font: '72px Roboto', fill: 'cyan', align: 'center' });
  stateText.anchor.setTo(0.5, 0.5);
  stateText.visible = false;
}

function update() {
  hero1.update();
  hero2.update();

  game.physics.arcade.collide(hero1, hero2);
  game.physics.arcade.collide(creeps, hero2);
  game.physics.arcade.collide(creeps, hero1);
  game.physics.arcade.collide(creeps, hero1.bullets, _attackCreepCallback, null, this);
  game.physics.arcade.collide(creeps, hero2.bullets, _attackCreepCallback, null, this);
  game.physics.arcade.collide(hero2.bullets, hero1, _heroShotCallback, null, this);
  game.physics.arcade.collide(hero1.bullets, hero2, _heroShotCallback, null, this);
  game.physics.arcade.collide(hero2.ultimate, hero1, _heroKillCallback, null, this);
  game.physics.arcade.collide(hero1.ultimate, hero2, _heroKillCallback, null, this);

  // collisions = [
  //   [hero1, hero2],
  //   [creeps, hero2],
  //   [creeps, hero1],
  //   [creeps, hero1.bullets, _attackCreepCallback, null, this],
  //   [creeps, hero2.bullets, _attackCreepCallback, null, this],
  //   [hero2.bullets, hero1],
  //   [hero1.bullets, hero2]
  // ];
  // collisions.forEach(function (arr) {
  //   game.physics.arcade.collide.apply(this, arr);
  // });
}

function _showIntro () {
  openText = game.add.text(game.world.centerX,game.world.centerY, "Let them fight!", { font: '72px Roboto', fill: 'cyan', align: 'center' });
  letthemfightfx.play();
  openText.anchor.setTo(0.5, 0.5);
  game.input.onDown.add(_removeIntro, this);
}

function _removeIntro () {
  game.input.onDown.remove(_removeIntro, this);
  openText.destroy();
}

function _heroShotCallback(_heroes, _bullets) {
  if (_bullets.player == 1) {
    hurtfx1.play();
  } else {
    hurtfx2.play();  
  }
}


function _heroKillCallback(_heroes, _bullets) {
  if (_bullets.player == 1) {
    hurtfx1.play();
    _bullets.kill();
    hero2.kill();
    winner = hero1;
  } else {
    hurtfx2.play();
    _bullets.kill();
    hero1.kill();
    winner = hero2;
  }
  stateText.visible = true;
  //the "click to restart" handler
  game.input.onTap.addOnce(_restart, this);
}

// creep die collision
function _attackCreepCallback(_creeps, _bullets) {
  _creeps.kill();
  _bullets.kill();
  _updateSpecialNum(_bullets.player);
  _updateBars();
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

function _createBullets(img) {
  var bullets = game.add.group();
  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;
  bullets.createMultiple(5, img);
  bullets.setAll('anchor.x', 0.5);
  bullets.setAll('anchor.y', 1);
  bullets.setAll('checkWorldBounds', true);
  bullets.setAll('outOfBoundsKill', true);

  return bullets;
}

function _updateSpecialNum(player) {
  if (player == 1) {
    hero1.special = (hero1.special < SPECIAL_LIMIT) ? hero1.special += 1 : SPECIAL_LIMIT;
  } else {
    hero2.special = (hero2.special < SPECIAL_LIMIT) ? hero2.special += 1 : SPECIAL_LIMIT;
  }
}

// HERO MAKER
function Hero(type, key) {
  var sprite, 
    FIXED_ROTATION = 90;

  switch (type) {
    // START BEAR
    case 'bear':
      sprite = game.add.sprite(50, 50, 'bear')
      sprite.special = 0;
      sprite.anchor.setTo(0.5, 0.5);
      sprite.scale.setTo(0.75, 0.75);
      sprite.animations.add('bear_run', [1, 2, 3, 4, 5, 6, 7], 8, true);
      sprite.animations.add('bear_chomp', [9, 10, 11, 12, 13, 14, 15], 2, true);
      sprite.animations.add('bear_idle', [0], 10, true);
      sprite.bullets = _createBullets('bear_bullets');
      sprite.chomp = function () {
        if (game.time.now > bulletTime) {
          laserfx1.play();
          //  Grab the first bullet we can from the pool
          bullet = sprite.bullets.getFirstExists(false);
          if (bullet) {
            bullet.reset(sprite.body.x + 16, sprite.body.y + 16);
            bullet.lifespan = 500;
            bullet.angle = sprite.angle;
            bullet.player = 1;
            game.physics.arcade.velocityFromAngle(sprite.angle + FIXED_ROTATION, 500, bullet.body.velocity);
            bulletTime = game.time.now + 50;
          }
        }
      };
      sprite.ultimate = _createBullets('bear_ulti');
      sprite.ulti = function () {
        if (game.time.now > bulletTime) {
          //  Grab the first bullet we can from the pool
          bullet = sprite.ultimate.getFirstExists(false);
          if (bullet && sprite.special >= SPECIAL_LIMIT) {
            explosionfx1.play();
            bullet.reset(sprite.body.x + 16, sprite.body.y + 16);
            bullet.lifespan = 1500;
            bullet.angle = sprite.angle;
            bullet.player = 1;
            game.physics.arcade.velocityFromAngle(sprite.angle + FIXED_ROTATION, 500, bullet.body.velocity);
            bulletTime = game.time.now + 50;
            sprite.special = 0;
            $('.p1').removeClass('glow').find('.barFill').css('height', 0);
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
          game.physics.arcade.velocityFromAngle(sprite.angle + FIXED_ROTATION, 300, sprite.body.velocity);
        } else if (key.down.isDown) {
          sprite.animations.play('bear_run');
          game.physics.arcade.velocityFromAngle(sprite.angle + FIXED_ROTATION, -200, sprite.body.velocity);
        }

        if (key.basic.isDown) {
          sprite.animations.play('bear_chomp');
        }

        // fast chomp
        // if (key.basic.isDown) { sprite.chomp(); }
        // slow chomp
        key.basic.onDown.add(sprite.chomp, this);
        key.special.onDown.add(sprite.ulti, this);

      }
      break;
    // END BEAR
    // START TOPCAT
    case 'topcat':
      sprite = game.add.sprite(650, 650, 'topcat');
      sprite.special = 0;
      sprite.anchor.setTo(0.5, 0.5);
      sprite.scale.setTo(0.75, 0.75);
      sprite.rotation = 135;
      sprite.animations.add('topcat_run', [1, 2, 3, 4, 5, 6, 7], 8, true);
      sprite.animations.add('topcat_chomp', [9, 10, 11, 12, 13, 14, 15], 2, true);
      sprite.animations.add('topcat_idle', [0], 10, true);
      sprite.bullets = _createBullets('topcat_bullets');
      sprite.chomp = function () {
        if (game.time.now > bulletTime) {
          laserfx1.play();
          //  Grab the first bullet we can from the pool
          bullet = sprite.bullets.getFirstExists(false);
          if (bullet) {
            bullet.reset(sprite.body.x + 16, sprite.body.y + 16);
            bullet.lifespan = 500;
            bullet.angle = sprite.angle;
            bullet.player = 2;
            game.physics.arcade.velocityFromAngle(sprite.angle + FIXED_ROTATION, 500, bullet.body.velocity);
            bulletTime = game.time.now + 50;
          }
        }
      };
      sprite.ultimate = _createBullets('topcat_ulti');
      sprite.ulti = function () {
        if (game.time.now > bulletTime) {
          //  Grab the first bullet we can from the pool
          bullet = sprite.ultimate.getFirstExists(false);
          if (bullet && sprite.special >= SPECIAL_LIMIT) {
            explosionfx1.play();
            bullet.reset(sprite.body.x + 16, sprite.body.y + 16);
            bullet.lifespan = 1200;
            bullet.angle = sprite.angle;
            bullet.player = 2;
            game.physics.arcade.velocityFromAngle(sprite.angle + FIXED_ROTATION, 800, bullet.body.velocity);
            bulletTime = game.time.now + 50;
            sprite.special = 0;
            $('.p2').removeClass('glow').find('.barFill').css('height', 0);
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
          sprite.animations.play('topcat_run');
          game.physics.arcade.velocityFromAngle(sprite.angle + FIXED_ROTATION, 300, sprite.body.velocity);
        } else if (key.down.isDown) {
          sprite.animations.play('topcat_run');
          game.physics.arcade.velocityFromAngle(sprite.angle + FIXED_ROTATION, -200, sprite.body.velocity);
        }

        if (key.basic.isDown) {
          sprite.animations.play('topcat_chomp');
        }

        // fast chomp
        // if (key.basic.isDown) { sprite.chomp(); }
        // slow chomp
        key.basic.onDown.add(sprite.chomp, this);
        key.special.onDown.add(sprite.ulti, this);

      }
      break;
    // END TOPCAT
    // START DEFAULT (CHICKEN)
    default:
      sprite = game.add.sprite(550, 550, 'chicken');
      sprite.special = 0;
      sprite.anchor.setTo(0.5, 0.5);
      sprite.rotation = 180;
      sprite.bullets = _createBullets('fireball');
      sprite.chomp = function () {
        if (game.time.now > bulletTime) {
          laserfx2.play();
          //  Grab the first bullet we can from the pool
          bullet = sprite.bullets.getFirstExists(false);
          if (bullet) {
            bullet.reset(sprite.body.x + 16, sprite.body.y + 16);
            bullet.lifespan = 150;
            bullet.angle = sprite.angle;
            bullet.player = 2;
            game.physics.arcade.velocityFromAngle(sprite.angle + FIXED_ROTATION, 800, bullet.body.velocity);
            bulletTime = game.time.now + 50;
          }
        }
      };
      sprite.ultimate = _createBullets('bear_ulti');
      sprite.ulti = function () {
        if (game.time.now > bulletTime) {
          //  Grab the first bullet we can from the pool
          bullet = sprite.ultimate.getFirstExists(false);
          if (bullet && sprite.special >= SPECIAL_LIMIT) {
            explosionfx2.play();
            bullet.reset(sprite.body.x + 16, sprite.body.y + 16);
            bullet.lifespan = 1500;
            bullet.angle = sprite.angle;
            bullet.player = 2;
            game.physics.arcade.velocityFromAngle(sprite.angle + FIXED_ROTATION, 500, bullet.body.velocity);
            bulletTime = game.time.now + 50;
            sprite.special = 0;
            $('.p2').removeClass('glow').find('.barFill').css('height', 0);
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
          game.physics.arcade.velocityFromAngle(sprite.angle + FIXED_ROTATION, 300, sprite.body.velocity);
        } else if (key.down.isDown) {
          game.physics.arcade.velocityFromAngle(sprite.angle + FIXED_ROTATION, -200, sprite.body.velocity);
        }

        // fast chomp
        // if (key.basic.isDown) { sprite.chomp(); }
        // slow chomp
        key.basic.onDown.add(sprite.chomp, this);
        key.special.onDown.add(sprite.ulti, this);
      }
    // END DEFAULT
  }
  game.physics.enable(sprite, Phaser.Physics.ARCADE);
  sprite.body.collideWorldBounds = true;

  return sprite;

}

// Update power bars
function _updateBars() {
  var $p1 = $('.p1');
  var $p2 = $('.p2');
  $p1.find('.barFill').height(600 / SPECIAL_LIMIT * hero1.special);
  $p2.find('.barFill').height(600 / SPECIAL_LIMIT * hero2.special);
  _glowMe($p1, hero1.special);
  _glowMe($p2, hero2.special);
}

// Power bar glow helper
function _glowMe($el, special) {
  return (special >= SPECIAL_LIMIT) ? $el.addClass('glow') : $el.removeClass('glow');
}


function _restart () {

  //  A new level starts
  
  //resets the life count
  // lives.callAll('revive');
  //  And brings the aliens back from the dead :)
  // aliens.removeAll();
  // createAliens();

  //revives the player
  hero1.revive();
  hero2.revive();
  //hides the text
  stateText.visible = false;

}