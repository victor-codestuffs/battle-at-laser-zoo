var game = new Phaser.Game(600, 600, Phaser.AUTO, 'phaser-stage', { preload: preload, create: create, update: update });

function preload() {
  game.load.image('chicken', 'assets/chicken.png');
  game.load.image('creep', 'assets/creep.png');
}

var animal;
var key = {};

function create() {

  game.stage.backgroundColor = '#e5cda1';

  game.physics.startSystem(Phaser.Physics.ARCADE);

  animal = game.add.sprite(50, 50, 'chicken');
  animal.anchor.setTo(0.5, 0.5);

  game.physics.enable(animal, Phaser.Physics.ARCADE);

  animal.body.collideWorldBounds = true;

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
    var s = creeps.create(game.rnd.integerInRange(100, 700), game.rnd.integerInRange(32, 200), 'creep');
    s.animations.add('spin', [0,1,2,3]);
    s.play('spin', 20, true);
    game.physics.enable(s, Phaser.Physics.ARCADE);
    s.body.velocity.x = game.rnd.integerInRange(-200, 200);
    s.body.velocity.y = game.rnd.integerInRange(-200, 200);
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

  if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
    animal.body.angularVelocity = -200;
  }
  else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
    animal.body.angularVelocity = 200;
  }

  if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
    game.physics.arcade.velocityFromAngle(animal.angle, 300, animal.body.velocity);
  }

  game.physics.arcade.collide(creeps);
}

// basic attack
function chomp() {
  console.log('chomp!');
}
