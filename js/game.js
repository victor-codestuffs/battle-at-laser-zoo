var game = new Phaser.Game(800, 800, Phaser.AUTO, 'phaser-stage', { preload: preload, create: create, update: update });

function preload() {
  game.load.image('chicken', 'assets/chicken.png');
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

}

// basic attack
function chomp() {
  console.log('chomp!');
}
