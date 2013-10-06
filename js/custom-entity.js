var Entity = require('crtrdg-entity'),
    inherits = require('inherits');

module.exports = CustomEntity;
inherits(CustomEntity, Entity);

function CustomEntity() {
  return this;
}

CustomEntity.prototype.loadOptions = function (options) {
  console.log("loading options");
  this.position = {
    x: options.position.x,
    y: options.position.y
  };

  this.size = {
    x: options.size.x,
    y: options.size.y
  };

  this.gravity = options.gravity;

  this.setBoundingBox();

  this.on('update', function(interval) {
    console.log("entity update");
    if (this.gravity) {
      console.log("this has gravity: " + this.gravity);
      this.velocity.y += gravity * (interval / 1000);
    }
    this.setBoundingBox();
    this.checkEntityCollisions();
  });
};

CustomEntity.prototype.setGravity = function (gravity) {
  this.gravity = gravity;
}

CustomEntity.prototype.move = function (velocity, delta) {
  this.position.x += velocity.x * delta;
  this.position.y += velocity.y * delta;
}

// this is just entity collisions
CustomEntity.prototype.checkEntityCollisions = function () {
  var entities = this.game.entities;
  var count = entities.length;
  for (var i = 0; i < count; i++) {
    if (entities[i] !== this) {
      if (this.boundingBox.intersects(entities[i].boundingBox)) {
        this.emit('collision', entities[i]);
      }
    }
  }
}