var Entity = require('crtrdg-entity'),
    inherits = require('inherits');

module.exports = GameTimer;
inherits(GameTimer, Entity);

function GameTimer() {
  this.gameTime = 0;
  this.on('update', function(interval) {
    this.gameTime = this.gameTime + interval;
  });

  // undulating between 0.5 and 1 every 2 seconds
  this.throbber = function () {
    return 0.5 + 0.5 * (Math.abs((this.gameTime % 2000) - 1000) / 1000);
  }

  // required entity properties
  this.position = { x: 0, y: 0 };
  this.size = { x: 0, y: 0 };
}