var CustomEntity = require('./custom-entity'),
    inherits = require('inherits');

module.exports = Enemy;
inherits(Enemy, CustomEntity);

function Enemy(options) {
  this.loadOptions(options);

  // copied from Player
  this.on('update', function(interval) {
    this.velocity.y += 980 * (interval / 1000);
  });
}


// copied from Player

var terminalV = 1500;
var terminalVSquared = terminalV * terminalV;

Enemy.prototype.fixVelocity = function () {
  var x = this.velocity.x, y = this.velocity.y;
  while ((x * x + y * y) > terminalVSquared) {
    x *= 0.95;
    y *= 0.95;
  }
  this.velocity.x = x;
  this.velocity.y = y;
};
