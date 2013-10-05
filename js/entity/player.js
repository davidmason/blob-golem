var CustomEntity = require('./custom-entity'),
    inherits = require('inherits');

module.exports = Player;
inherits(Player, CustomEntity);

function Player(options) {
  this.loadOptions(options);
}

Player.prototype.keyboardInput = function(keyboard){
  if ('A' in keyboard.keysDown){
    this.velocity.x = -this.speed;
  }

  if ('D' in keyboard.keysDown){
    this.velocity.x = this.speed;
  }

  if ('W' in keyboard.keysDown){
    this.velocity.y = -this.speed;
  }

  if ('S' in keyboard.keysDown){
    this.velocity.y = this.speed;
  }
};