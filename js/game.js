var game = new Phaser.Game(1000, 600, Phaser.AUTO, 'phaser-stage', { preload: preload, create: create, update: update });

function preload() {
  game.load.image('blue-line', 'assets/blue-line.png');
  game.load.image('red-line', 'assets/red-line.png');
  game.load.image('orange-line', 'assets/orange-line.png');
  game.load.image('dark-line', 'assets/dark-line.png');
  game.load.image('ship', 'assets/ship.png');
}

var ship;
var cursors;
var upKey, downKey, leftKey, rightKey, spaceKey, aKey, wKey, sKey, dKey;

function create() {

  game.stage.backgroundColor = '#010e1e';

  //  In this example we'll create 4 specific keys (up, down, left, right) and monitor them in our update function

  upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
  downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
  leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
  rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
  spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
  wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
  sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
  dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);


  var em1 = game.add.emitter(game.world.width, game.world.centerY, 200);

  // emitter.width = game.world.width;
  em1.height = game.world.height / 3;
  // em1.angle = 30; // uncomment to set an angle
  em1.makeParticles(['blue-line', 'red-line', 'orange-line', 'dark-line']);
  em1.gravity = 0;
  em1.minParticleScale = 0.1;
  em1.maxParticleScale = 1;
  em1.setYSpeed(-2, 2);
  em1.setXSpeed(-1000, -500);
  em1.minRotation = 0;
  em1.maxRotation = 0;
  em1.start(false, 4000, 20, 0);

  var em2 = game.add.emitter(game.world.width, game.world.centerY, 100);

  em2.height = game.world.height;
  em2.makeParticles('dark-line');
  em2.gravity = 0;
  em2.minParticleScale = 0.5;
  em2.maxParticleScale = 1;
  em2.setYSpeed(-2, 2);
  em2.setXSpeed(-500, -250);
  em2.minRotation = 0;
  em2.maxRotation = 0;
  em2.start(false, 4000, 20, 0);

    //  Add a sprite
  ship = game.add.sprite(50, game.world.centerY - 50, 'ship');
  ship2 = game.add.sprite(150, game.world.centerY - 50, 'ship');

  spaceKey.onDown.add(fireLaser, this);

}

function update() {

  if (upKey.isDown) {
    ship.y--;
  } else if (downKey.isDown) {
    ship.y++;
  }

  if (leftKey.isDown) {
    ship.x--;
  } else if (rightKey.isDown) {
    ship.x++;
  }

  if (wKey.isDown) {
    ship2.y--;
  } else if (sKey.isDown) {
    ship2.y++;
  }

  if (aKey.isDown) {
    ship2.x--;
  } else if (dKey.isDown) {
    ship2.x++;
  }
  

}

function fireLaser() {
  console.log('fire!');
}
