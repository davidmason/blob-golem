var CustomEntity = require('./custom-entity'),
    inherits = require('inherits');

module.exports = Player;
inherits(Player, CustomEntity);

function Player(options) {
  this.loadOptions(options);
}
