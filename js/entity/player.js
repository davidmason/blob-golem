var CustomEntity = require('./custom-entity'),
    inherits = require('inherits');

var accelGravity = 980;

module.exports = Player;
inherits(Player, CustomEntity);

function Player(options) {
  this.loadOptions(options);

  this.on('update', function(interval) {
    this.velocity.y += accelGravity * (interval / 1000);
  });

}

Player.prototype.keyboardInput = function(keyboard){
  if ('<space>' in keyboard.keysDown) {
    if (!this.jumping) {
      this.velocity.y = -400;
      this.jumping = true;
      this.startAnimation('leap');
    }
  }
  if ('A' in keyboard.keysDown){
    this.velocity.x = -this.speed;
  }
  if ('D' in keyboard.keysDown){
    this.velocity.x = this.speed;
  }
};

var terminalV = 1500;
var terminalVSquared = terminalV * terminalV;

Player.prototype.fixVelocity = function () {
  var x = this.velocity.x, y = this.velocity.y;
  while ((x * x + y * y) > terminalVSquared) {
    x *= 0.95;
    y *= 0.95;
  }
  this.velocity.x = x;
  this.velocity.y = y;
};