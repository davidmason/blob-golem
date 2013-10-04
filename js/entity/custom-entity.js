var Entity = require('crtrdg-entity'),
    inherits = require('inherits'),
    aabb = require('aabb-2d');


module.exports = CustomEntity;
inherits(CustomEntity, Entity);

function CustomEntity() {
  return this;
}

CustomEntity.prototype.loadOptions = function (options) {
  this.position = {
    x: options.position.x,
    y: options.position.y
  };

  this.size = {
    x: options.size.x,
    y: options.size.y
  };

  this.setBoundingBox();

  this.on('update', function(interval) {
    this.setBoundingBox();
    this.checkCollisions();
  });
};

CustomEntity.prototype.move = function (velocity) {
  this.position.x += velocity.x;
  this.position.y += velocity.y;
}

CustomEntity.prototype.checkCollisions = function () {
  var entities = this.game.entities;
  var count = entities.length;
  for (var i = 0; i < count; i++) {
    if (entities[i] !== this) {
      if (this.touches(entities[i])) {
        this.emit('collision', entities[i]);
      }
    }
  }
}