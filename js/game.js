var game = new Phaser.Game(800, 800, Phaser.AUTO, 'phaser-stage', { preload: preload, create: create, update: update });

function preload() {
  game.load.image('chicken', 'assets/chicken.png');
  game.load.image('creep', 'assets/creep.png');
}

var animal;
var key = {};

function create() {

  game.stage.backgroundColor = '#e5cda1';

  key.up = game.input.keyboard.addKey(Phaser.Keyboard.UP);
  key.down = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
  key.left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
  key.right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
  key.space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  //  Add a sprite
  animal = game.add.sprite(50, game.world.centerY - 50, 'chicken');

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

  if (key.up.isDown) {
    animal.y--;
  } else if (key.down.isDown) {
    animal.y++;
  }

  if (key.left.isDown) {
    animal.x--;
  } else if (key.right.isDown) {
    animal.x++;
  }

  game.physics.arcade.collide(creeps);
}

// basic attack
function chomp() {
  console.log('chomp!');
}
