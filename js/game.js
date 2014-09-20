var game = new Phaser.Game(600, 600, Phaser.AUTO, 'phaser-stage', { preload: preload, create: create, update: update });

function preload() {
  game.load.image('chicken', 'assets/chicken.png');
  game.load.image('fireball', 'assets/fireball.png');
  game.load.image('creep', 'assets/creep.png');
}

var animal;
var key = {};
var bullets;
var fireRate = 100;
var nextFire = 0;

function create() {

  game.stage.backgroundColor = '#e5cda1';

  game.physics.startSystem(Phaser.Physics.ARCADE);

  animal = game.add.sprite(50, 50, 'chicken');
  animal.anchor.setTo(0.5, 0.5);

  game.physics.enable(animal, Phaser.Physics.ARCADE);

  animal.body.collideWorldBounds = true;

  bullets = game.add.group();
  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;
  bullets.createMultiple(5, 'fireball');
  bullets.setAll('checkWorldBounds', true);
  bullets.setAll('outOfBoundsKill', true);

  key.up = game.input.keyboard.addKey(Phaser.Keyboard.UP);
  key.down = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
  key.left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
  key.right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
  key.space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  key.space.onDown.add(chomp, this);


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

  if (key.left.isDown) {
    animal.body.angularVelocity = -200;
  }
  else if (key.right.isDown) {
    animal.body.angularVelocity = 200;
  }

  if (key.up.isDown) {
    game.physics.arcade.velocityFromAngle(animal.angle, 300, animal.body.velocity);
  }

  // if (key.space.isDown) {
  //   chomp();
  // }

  game.physics.arcade.collide(creeps, animal);
}

// basic attack
function chomp() {
  if (game.time.now > nextFire && bullets.countDead() > 0) {
    nextFire = game.time.now + fireRate;
    var bullet = bullets.getFirstDead();
    bullet.reset(animal.x - 8, animal.y - 8); 
    game.physics.arcade.moveToPointer(bullet, 300);
  }
}
