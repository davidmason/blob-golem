var Entity = require('crtrdg-entity'),
    inherits = require('inherits'),
    aabb = require('aabb-2d');


module.exports = CustomEntity;
inherits(CustomEntity, Entity);

function CustomEntity() {
  return this;
}

CustomEntity.prototype.loadOptions = function (options) {
  this.descriptor = options.descriptor;

  if (this.descriptor) {
    this.size = {
      x: this.descriptor.width,
      y: this.descriptor.height
    }
  } else {
    this.size = {
      x: options.size.x,
      y: options.size.y
    };
  }

  this.position = {
    x: options.position.x,
    y: options.position.y
  };

  if (options.velocity) {
    this.velocity = {
      x: options.velocity.x,
      y: options.velocity.y
    };
  } else {
    this.velocity = { x: 0, y: 0 };
  }

  this.speed = options.speed || 0;

  this.setBoundingBox();

  this.on('update', function(interval) {
    this.setBoundingBox();
    this.checkCollisions();
  });
};

CustomEntity.prototype.move = function (velocity, delta) {
  if (delta) {
    this.position.x += velocity.x * delta;
    this.position.y += velocity.y * delta;
  } else {
    this.position.x += velocity.x;
    this.position.y += velocity.y;
  }
}

CustomEntity.prototype.checkMove = function (velocity, delta) {
  var x = this.position.x + velocity.x * delta;
  var y = this.position.y + velocity.y * delta;
  return aabb([x, y], [this.size.x, this.size.y]);
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

CustomEntity.prototype.startAnimation = function (animationName) {
  var animation = this.descriptor.sprite.animations[animationName];

  if (animation) {
    this.animation = {
      name: animationName,
      length: animation.length,
      frame: 0,
      remainingTime: animation[0][2] || 100,
      frames: animation
    };
  } else {
    console.log('failed to initiate animation ' + animationName);
  }

};