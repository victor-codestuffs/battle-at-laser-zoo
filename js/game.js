var game = new Phaser.Game(1280, 720, Phaser.AUTO, 'phaser-stage', { preload: preload, create: create, update: update, render:render  });

WebFontConfig = {
  active: function () { game.time.events.add(Phaser.Timer.SECOND, _showIntro, this); },
  google: { families: ['Roboto'] }
};

function preload() {
  game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
  game.load.json('config', 'js/config.json');
  game.load.json('controls', 'js/controls.json');
  game.load.image('arena', 'assets/super_map.png');
  game.load.image('chicken', 'assets/chicken.png');
  game.load.image('fireball', 'assets/fireball.png');
  game.load.image('creep', 'assets/creep.png');
  game.load.spritesheet('bear', 'assets/sprite_bearrage.png', 100, 100);
  game.load.spritesheet('bear_bullets', 'assets/sprite_bearrage_chomp.png', 60, 25);
  game.load.spritesheet('bear_ulti', 'assets/sprite_bearrage_ulti.png', 120, 92);
  game.load.spritesheet('topcat', 'assets/sprite_topcat.png', 100, 100);
  game.load.spritesheet('topcat_bullets', 'assets/sprite_topcat_chomp.png', 30, 54);
  game.load.spritesheet('topcat_ulti', 'assets/sprite_topcat_ulti.png', 120, 100);
  game.load.spritesheet('dog', 'assets/sprite_downwarddog.png', 100, 100);
  game.load.spritesheet('dog_bullets', 'assets/sprite_downwarddog_chomp.png', 49, 49);
  game.load.spritesheet('dog_ulti', 'assets/sprite_downwarddog_ulti.png', 47, 142);
  game.load.audio('laser1', 'assets/audio/laser-1.wav');
  game.load.audio('laser2', 'assets/audio/laser-2.wav');
  game.load.audio('hurt1', 'assets/audio/hurt-1.wav');
  game.load.audio('hurt2', 'assets/audio/hurt-2.wav');
  game.load.audio('explosion1', 'assets/audio/explosion-1.wav');
  game.load.audio('explosion2', 'assets/audio/explosion-2.wav');
  game.load.audio('letthemfight', 'assets/audio/letthemfight.mp3');
}

var bg, fx = {};
var player1 = {}, player2 = {};
var hero1, hero2, creeps;
var bullets, bulletTime = 0, fireRate = 100, nextFire = 0;
var introText = null, stateText = null;
var config, controls;
var pad1;
var soundEnabled = false;

// CONSTANTS
var SPECIAL_LIMIT = 3;
var CREEP_LIMIT = 20;
var CREEP_REGEN_TIME = 3;
var FIXED_ROTATION = 90; // fixes sprite angle


function create() {

  bg = game.add.tileSprite(0, 0, 1280, 720, 'arena');

  game.physics.startSystem(Phaser.Physics.ARCADE);

  config = game.cache.getJSON('config');
  controls = game.cache.getJSON('controls');

  // for xbox controller
  game.input.gamepad.start();

  // hero1 = new Hero('bearrage', 1, 'gamepad');
  // hero1 = new Hero('downwarddog', 1, 'keyboard');
  hero1 = new Hero('bearrage', 1, 'keyboard');
  hero2 = new Hero('topcat', 2, 'keyboard');
  creeps = _createCreeps(CREEP_LIMIT);

  // sound fx
  fx.laser1 = game.add.audio('laser1');
  fx.laser2 = game.add.audio('laser2');
  fx.hurt1 = game.add.audio('hurt1');
  fx.hurt2 = game.add.audio('hurt2');
  fx.explosion1 = game.add.audio('explosion1');
  fx.explosion2 = game.add.audio('explosion2');
  fx.letThemFight = game.add.audio('letthemfight');

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

function render() {
  game.debug.body(hero1);
  game.debug.spriteBounds(hero1.bullets);
  game.debug.spriteBounds(hero1.ultimate);
  game.debug.body(hero2);
  game.debug.spriteBounds(hero2.bullets);
  game.debug.spriteBounds(hero2.ultimate);
}

// HERO MAKER
function Hero(character, playerNum, inputType) {
  var sprite, cfg, anim, input, map, buttons;

  switch (character) {
    case "bearrage":
      cfg = config.bearrage;
      break;
    case "topcat":
      cfg = config.topcat;
      break;
    case "downwarddog":
      cfg = config.downwarddog;
      break;
    default:
      cfg = config.chicken;
  }

  input = _getInput(inputType);
  map = _getMapping(inputType);
  buttons = _getButtons(inputType, playerNum);

  sprite = game.add.sprite(cfg.sprite.x, cfg.sprite.y, cfg.sprite.key, cfg.sprite.frame)
  sprite.rotation = cfg.rotation;
  sprite.anchor.setTo(0.5, 0.5);
  sprite.scale.setTo(0.75, 0.75);
  sprite.special = 0;
  for (var i = 0; i < cfg.add_anims.length; i++) {
    anim = cfg.add_anims[i];
    sprite.animations.add(anim.key, anim.frames, anim.fps, anim.loop);
  }

  sprite.bullets = _createBullets(cfg.basic.key);
  sprite.ultimate = _createBullets(cfg.ultimate.key);

  // basic attack
  sprite.chomp = function () {
    if (game.time.now > bulletTime) {
      if (soundEnabled) {
        fx[cfg.fx.basic].play();
      }
      //  Grab the first bullet we can from the pool
      bullet = sprite.bullets.getFirstExists(false);
      if (bullet) {
        bullet.reset(sprite.body.x + 16, sprite.body.y + 16);
        bullet.lifespan = cfg.basic.lifespan;
        bullet.angle = sprite.angle;
        bullet.player = playerNum;
        game.physics.arcade.velocityFromAngle(sprite.angle + FIXED_ROTATION, cfg.basic.speed, bullet.body.velocity);
        bulletTime = game.time.now + 50;
      }
    }
  };

  // ultimate attack
  sprite.ulti = function () {
    if (game.time.now > bulletTime) {
      //  Grab the first bullet we can from the pool
      bullet = sprite.ultimate.getFirstExists(false);
      if (bullet && sprite.special >= SPECIAL_LIMIT) {
        if (soundEnabled) {
          fx[cfg.fx.ultimate].play();
        }
        bullet.reset(sprite.body.x + 16, sprite.body.y + 16);
        bullet.lifespan = cfg.ultimate.lifespan;
        bullet.angle = sprite.angle;
        bullet.player = playerNum;
        game.physics.arcade.velocityFromAngle(sprite.angle + FIXED_ROTATION, cfg.ultimate.speed, bullet.body.velocity);
        bulletTime = game.time.now + 50;
        sprite.special = 0;
        $('.p' + playerNum).removeClass('glow').find('.barFill').css('height', 0);
      }
    }
  };

  sprite.update = function () {

    sprite.body.velocity.x = 0;
    sprite.body.velocity.y = 0;
    sprite.body.angularVelocity = 0;

    if (input.isDown(map[buttons.left])) {
      sprite.body.angularVelocity = -cfg.speed.turn;
    } else if (input.isDown(map[buttons.right])) {
      sprite.body.angularVelocity = cfg.speed.turn;
    }

    if (input.isDown(map[buttons.forward])) {
      sprite.animations.play(cfg.update_anims.move);
      game.physics.arcade.velocityFromAngle(sprite.angle + FIXED_ROTATION, cfg.speed.forward, sprite.body.velocity);
    } else if (input.isDown(map[buttons.back])) {
      sprite.animations.play(cfg.update_anims.move);
      game.physics.arcade.velocityFromAngle(sprite.angle + FIXED_ROTATION, cfg.speed.backward, sprite.body.velocity);
    }

    if (input.isDown(map[buttons.basic])) {
      sprite.animations.play(cfg.update_anims.attack);
      sprite.chomp();
    }

    if (input.isDown(map[buttons.special])) {
      sprite.ulti();
    }

    // fast chomp
    // if (input.basic.isDown) { sprite.chomp(); }
    // slow chomp
    // input.basic.onDown.add(sprite.chomp, this);
    // input.special.onDown.add(sprite.ulti, this);

  }

  game.physics.enable(sprite, Phaser.Physics.ARCADE);
  sprite.body.collideWorldBounds = true;

  return sprite;

}

// 
// COLLISION FUNCTIONS
// 

function _heroShotCallback(_heroes, _bullets) {
  if (soundEnabled) {
    if (_bullets.player == 1) {
      fx.hurt1.play();
    } else {
      fx.hurt2.play();  
    }
  }
}

function _heroKillCallback(_heroes, _bullets) {
  if (_bullets.player == 1) {
    if (soundEnabled) {
      fx.hurt1.play();
    }
    hero2.kill();
  } else {
    if (soundEnabled) {
      fx.hurt2.play();
    }
    hero1.kill();
  }
  _bullets.kill();
  stateText.visible = true;
  //the "click to restart" handler
  game.input.onTap.addOnce(_restart, this);
}

function _attackCreepCallback(_creeps, _bullets) {
  _creeps.kill();
  _bullets.kill();
  _updateSpecialNum(_bullets.player);
  _updateBars();
}

// 
// CREEP FUNCTIONS
// 

function _createCreeps(num) {
  var creeps = game.add.group();

  for (var i = 0; i < num; i++) {
    var creep = creeps.create(_rnd(100, 700), _rnd(32, 700), 'creep');
    game.physics.enable(creep, Phaser.Physics.ARCADE);
    creep.body.velocity.x = _rnd(-100, 100);
    creep.body.velocity.y = _rnd(-100, 100);
    creep.body.angularVelocity = _rnd(-100, 100);
  }

  creeps.setAll('body.collideWorldBounds', true);
  creeps.setAll('body.bounce.x', 1);
  creeps.setAll('body.bounce.y', 1);
  creeps.setAll('body.minBounceVelocity', 0);
  game.time.events.repeat(Phaser.Timer.SECOND * CREEP_REGEN_TIME, CREEP_LIMIT, _resurrectCreep, this);

  return creeps;
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

// 
// HELPERS
// 

// key bind helper
function _getInput(inputType) {
  return (inputType === 'gamepad') ? game.input.gamepad.pad1 : game.input.keyboard;
}

function _getMapping(inputType) {
  return (inputType === 'gamepad') ? Phaser.Gamepad : Phaser.Keyboard;
}

function _getButtons(inputType, playerNum) {
  var buttons;

  if (inputType === 'gamepad') {
    buttons = controls.gamepad;
  } else {
    if (playerNum === 1) {
      buttons = controls.keyboard;
    } else {
      buttons = controls.keyboard2;
    }
  }

  return buttons;
}

// random number helper
function _rnd(low, high) {
  return game.rnd.integerInRange(low, high);
}

function _createBullets(img) {
  var bullets = game.add.group();
  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;
  bullets.createMultiple(1, img);
  bullets.setAll('anchor.x', 0.5);
  bullets.setAll('anchor.y', 0.5);
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

// 
// BATTLE FUNCTIONS
// 

function _restart () {

  //  A new level starts
  
  //resets the life count
  // lives.callAll('revive');
  creeps.removeAll();
  creeps = _createCreeps(CREEP_LIMIT);

  //revives the player
  hero1.revive();
  hero2.revive();
  //hides the text
  stateText.visible = false;

}

// 
// TEXT FUNCTIONS
// 

function _showIntro () {
  if (soundEnabled) {
    fx.letThemFight.play();
  }
  introText = game.add.text(game.world.centerX,game.world.centerY, "Let them fight!");
  introText.font = 'Roboto';
  introText.fill = 'cyan';
  introText.fontSize = 60;
  introText.align = 'center';
  introText.anchor.setTo(0.5, 0.5);

  stateText = game.add.text(game.world.centerX,game.world.centerY, "You're winner\nClick to restart");
  stateText.font = 'Roboto';
  stateText.fill = 'cyan';
  stateText.fontSize = 60;
  stateText.align = 'center';
  stateText.anchor.setTo(0.5, 0.5);
  stateText.visible = false;

  game.input.onDown.add(_removeIntro, this);

}

function _removeIntro () {
  game.input.onDown.remove(_removeIntro, this);
  introText.destroy();
}
