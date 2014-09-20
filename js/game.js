var game = new Phaser.Game(600, 600, Phaser.AUTO, 'phaser-stage', { preload: preload, create: create, update: update });

function preload() {
  game.load.spritesheet('bear', 'assets/sprite_bearrage.png', 100, 100);
  game.load.image('chicken', 'assets/chicken.png');
  game.load.image('fireball', 'assets/fireball.png');
  game.load.image('creep', 'assets/creep.png');
}

// TODO: Refactor code for 2 animals

var animal;
var animal2;
var creeps;
var key = {};
var key2 = {};
var bullets, bulletTime = 0;
var fireRate = 100;
var nextFire = 0;

function create() {

  game.stage.backgroundColor = '#e5cda1';

  game.physics.startSystem(Phaser.Physics.ARCADE);

  animal = game.add.sprite(50, 50, 'bear');
  animal.anchor.setTo(0.5, 0.5);
  animal.scale.setTo(0.75, 0.75);
  animal.animations.add('bear_run', [1, 2, 3, 4, 5, 6, 7], 10, true);
  animal.animations.add('bear_idle', [0], 10, true);

  animal2 = game.add.sprite(550, 550, 'chicken');
  animal2.anchor.setTo(0.5, 0.5);
  animal2.rotation = 180;

  game.physics.enable(animal, Phaser.Physics.ARCADE);
  game.physics.enable(animal2, Phaser.Physics.ARCADE);

  animal.body.collideWorldBounds = true;
  animal2.body.collideWorldBounds = true;

  bullets = game.add.group();
  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;
  bullets.createMultiple(10, 'fireball');
  bullets.setAll('anchor.x', 0.5);
  bullets.setAll('anchor.y', 1);
  bullets.setAll('checkWorldBounds', true);
  bullets.setAll('outOfBoundsKill', true);

  key.up = game.input.keyboard.addKey(Phaser.Keyboard.W);
  key.down = game.input.keyboard.addKey(Phaser.Keyboard.S);
  key.left = game.input.keyboard.addKey(Phaser.Keyboard.A);
  key.right = game.input.keyboard.addKey(Phaser.Keyboard.D);
  key.space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  key2.up = game.input.keyboard.addKey(Phaser.Keyboard.UP);
  key2.down = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
  key2.left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
  key2.right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
  key2.enter = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
  
  key.space.onDown.add(chomp, this);
  key2.enter.onDown.add(chomp2, this);

  // add creeps
  creeps = game.add.group();

  for (var i = 0; i < 30; i++)
  {
    var s = creeps.create(game.rnd.integerInRange(100, 700), game.rnd.integerInRange(32, 700), 'creep');
    s.animations.add('spin', [0,1,2,3]);
    s.play('spin', 20, true);
    game.physics.enable(s, Phaser.Physics.ARCADE);
    s.body.velocity.x = game.rnd.integerInRange(-100, 100);
    s.body.velocity.y = game.rnd.integerInRange(-100, 100);
  }

  creeps.setAll('body.collideWorldBounds', true);
  creeps.setAll('body.bounce.x', 1);
  creeps.setAll('body.bounce.y', 1);
  creeps.setAll('body.minBounceVelocity', 0);

}

function update() {

  animal.body.velocity.x = 0;
  animal.body.velocity.y = 0;
  animal.body.angularVelocity = 0;

  // calculate movement in terms of character angle. changes direction with left and right.

  if (key.left.isDown) {
    animal.body.angularVelocity = -200;
  } else if (key.right.isDown) {
    animal.body.angularVelocity = 200;
  }

  if (key.up.isDown) {
    animal.animations.play('bear_run');
    game.physics.arcade.velocityFromAngle(animal.angle + 90, 300, animal.body.velocity);
  } else if (key.down.isDown) {
    animal.animations.play('bear_run');
    game.physics.arcade.velocityFromAngle(animal.angle + 90, -200, animal.body.velocity);
  } else {
    animal.animations.play('bear_idle');
  }

  // animal 2
  animal2.body.velocity.x = 0;
  animal2.body.velocity.y = 0;
  animal2.body.angularVelocity = 0;

  if (key2.left.isDown) {
    animal2.body.angularVelocity = -200;
  } else if (key2.right.isDown) {
    animal2.body.angularVelocity = 200;
  }

  if (key2.up.isDown) {
    game.physics.arcade.velocityFromAngle(animal2.angle + 90, 300, animal2.body.velocity);
  } else if (key2.down.isDown) {
    game.physics.arcade.velocityFromAngle(animal2.angle + 90, -200, animal2.body.velocity);
  }

  // if (key.space.isDown) {
  //   chomp();
  // }

  game.physics.arcade.collide(animal, animal2);
  game.physics.arcade.collide(creeps, animal2);
  game.physics.arcade.collide(creeps, animal);
  game.physics.arcade.collide(creeps, bullets, fireballCreepCallback, null, this);
}

// basic attack
function chomp() {
  if (game.time.now > bulletTime) {
    //  Grab the first bullet we can from the pool
    bullet = bullets.getFirstExists(false);
    if (bullet) {
      bullet.reset(animal.body.x + 16, animal.body.y + 16);
      bullet.lifespan = 150;
      bullet.rotation = animal.angle;
      game.physics.arcade.velocityFromAngle(animal.angle + 90, 800, bullet.body.velocity);
      bulletTime = game.time.now + 50;
    }
  }
}

function chomp2() {
  if (game.time.now > bulletTime) {
    //  Grab the first bullet we can from the pool
    bullet = bullets.getFirstExists(false);
    if (bullet) {
      bullet.reset(animal2.body.x + 16, animal2.body.y + 16);
      bullet.lifespan = 150;
      bullet.rotation = animal2.angle;
      game.physics.arcade.velocityFromAngle(animal2.angle + 90, 800, bullet.body.velocity);
      bulletTime = game.time.now + 50;
    }
  }
}

// creep die collision
function fireballCreepCallback (_creeps, _bullets) {
  _creeps.kill();
  _bullets.kill();
}
