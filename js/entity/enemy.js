var CustomEntity = require('./custom-entity'),
    inherits = require('inherits');

module.exports = Enemy;
inherits(Enemy, CustomEntity);

function Enemy(options) {
  this.loadOptions(options);
}