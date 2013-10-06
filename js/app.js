var Game = require('crtrdg-gameloop'),
    Keyboard = require('crtrdg-keyboard'),
    Mouse = require('crtrdg-mouse'),
    Player = require('./entity/player'),
    Enemy = require('./entity/enemy'),
    loadImages = require('image-batch-loader'),
    loadSounds = require('./load-audio'),
    Map = require('./map/load-map'),
    drawBigText = require('./draw-big-text'),
    GameTimer = require('./game-timer'),
    aabb = require('aabb-2d');

var imagesToLoad = [];

var addEntity = function (entityDescriptor) {
  imagesToLoad.push(entityDescriptor.sprite.file);
}

var defaultFrameMillis = 100;

// adding entities
var blob = require('./../entities/blob.json');
addEntity(blob);
var beetleDescriptor = require('./../entities/beetle.json');
addEntity(beetleDescriptor);
var frogDescriptor = require('./../entities/frog.json');
addEntity(frogDescriptor);
var chipmunkDescriptor = require('./../entities/chipmunk.json');
addEntity(chipmunkDescriptor);
var squirrelDescriptor = require('./../entities/squirrel.json');
addEntity(squirrelDescriptor);



var images = {};
var imagesLoaded = false;

loadImages(imagesToLoad, function(loadedImages) {
  images = loadedImages;
  imagesLoaded = true;
  console.log("loaded all images");
});

var sounds = {};
var soundsLoaded = false;
loadSounds(['audio/effects/eat_animal'], function (loadedSounds) {
  sounds = loadedSounds;
  soundsLoaded = true;
  console.log("loaded all sounds");
});

var game = new Game({
  canvas: 'main-canvas',
  width: 1200,
  height: 650,
  backgroundColor: '#95c8f0'
});

// appears not to be possible to pass in a string to use for require
var map = require('./../maps/tutorial.json');
var level = new Map(game, map);

var keyboard = new Keyboard(game);
var mouse = new Mouse(game);
mouse.on('click', function(location){
  // console.log("clicked at location (" + location.x + ", " + location.y + ")");
  // if (soundsLoaded) {
  //   sounds['audio/effects/In_water'].play();
  // }
});

keyboard.on('keydown', function(keyCode){
  if (keyCode === 'P'){
    if (game.ticker.paused === true){
      game.resume();
    } else {
      game.pause();
    }
  }
});

var gameTimer = new GameTimer();
gameTimer.addTo(game);

var player = new Player({
  descriptor: blob,
  position: { x: -700, y: -2000 },
  size: { x: 10, y: 10 },
  speed: 400,
  gravity: true
});
player.velocity.x = 500;

player.startAnimation('stationary');

player.on('update', function (interval) {
  if (level.loaded) {
    this.fixVelocity();

    // var newPos = this.checkMove(this.velocity, (interval / 1000));
    // if (level.checkCollision(newPos)) {
    //   // FIXME should move as far as possible
    //   this.velocity.x = 0;
    //   this.velocity.y = 0;

    //   // check needed or it stays on first frame
    //   if (this.jumping) { this.startAnimation('stationary'); }
    //   this.jumping = false;
    // }


    // copied from enemy update below
    var newPos = this.checkMove(this.velocity, (interval / 1000));
    if (level.checkCollision(newPos)) {
      newPos = this.checkMove({ x: this.velocity.x, y: 0 }, (interval / 1000));
      if (!level.checkCollision(newPos)) {
        this.velocity.y = 0;
        this.velocity.x *= 0.7;
        if (this.jumping) { this.startAnimation('stationary'); }
        this.jumping = false;
      } else {
        newPos = this.checkMove({ x: 0, y: this.velocity.y }, (interval / 1000));
        if (!level.checkCollision(newPos)) {
          this.velocity.x = 0;
        } else {
          this.velocity.x = 0;
          this.velocity.y = 0;
          if (this.jumping) { this.startAnimation('stationary'); }
          this.jumping = false;
        }

      }
      // FIXME should move as far as possible
    }


    this.keyboardInput(keyboard);
    this.move(this.velocity, (interval / 1000));

    if (this.velocity.x > 0.1) this.left = false;
    else if (this.velocity.x < -0.1) this.left = true;
  }

  // advance animation frame if time to
  var anim = this.animation;
  anim.remainingTime -= interval;
  if (anim.remainingTime <= 0) {
    anim.frame = (this.animation.frame + 1) % this.animation.length;
    anim.remainingTime = (anim.frames[anim.frame][2] || defaultFrameMillis) + anim.remainingTime;
  }

});

player.on('draw', function (ctx) {
  var self = this;
  if (imagesLoaded) {
    drawWithCamera (ctx, function (context) {
      var playerScale = 1.1;
      var sprite = self.descriptor.sprite;
      var anim = self.animation;

      var w = sprite.width, h = sprite.height;
      var img = images[sprite.file];
      var frame = anim.frames[anim.frame];

      context.save();
      context.translate(self.position.x, self.position.y);
      context.globalAlpha = 0.90;
      if (self.left) {
        context.translate(self.size.x, 0);
        context.scale(-1, 1);
      }
      context.drawImage(img,
                  frame[0] * w, frame[1] * h, w, h,
                  0, 0, self.size.x * playerScale, self.size.y * playerScale);
                  // self.position.x, self.position.y, self.size.x, self.size.y);
      context.restore();
    });
  }
});

player.on('collision', function (entity) {
  if (player.animation.name !== 'chomp') {
    player.startAnimation('chomp');
  }

  // fixme: how to stop it?

  // Note: this plays a sound every frame
  // TODO add collision-start, collision-end
  if (soundsLoaded) {
    sounds['audio/effects/eat_animal'].play();
    setTimeout(function () {
      sounds['audio/effects/eat_animal'].pause();
    }, 3000)
  }
});

game.camera = { x: 0, y: 0 };

game.on('update', function (interval) {
  // set camera position to position of blob
  //context.save();
  game.camera.x = -player.position.x + (game.width - player.size.x) / 2;
  game.camera.y = -player.position.y + (game.height - player.size.y) / 2;
  // then make sure it is within the background bounds
});

var drawWithCamera = function (context, drawAction) {
  context.save();
  context.translate(game.camera.x, game.camera.y);
  drawAction(context);
  context.restore();
}

game.on('draw', function (context) {
    if (imagesLoaded) {
      if (game.paused) drawBigText(context, game, "paused", 0.75);
    } else {
      drawBigText(context, game, "loading", gameTimer.throbber);
    }
});


// beyond here, there be enemies

var setUpdateFor = function (entity) {
  entity.on('update', function (interval) {

    if (level.loaded) {
      this.fixVelocity();

      // this horrible mess tries to move on both dimensions
      // then if it fails it tries horizontal, then vertical if that fails
      // and finally gives up
      var newPos = this.checkMove(this.velocity, (interval / 1000));
      if (level.checkCollision(newPos)) {
        newPos = this.checkMove({ x: this.velocity.x, y: 0 }, (interval / 1000));
        if (!level.checkCollision(newPos)) {
          this.velocity.y = 0;
        } else {
          newPos = this.checkMove({ x: 0, y: this.velocity.y }, (interval / 1000));
          if (!level.checkCollision(newPos)) {
            this.velocity.x = 0;
          } else {
            this.velocity.x = 0;
            this.velocity.y = 0;
          }

        }
        // FIXME should move as far as possible
      }


      // TODO maybe decide on random movement

      this.move(this.velocity, (interval / 1000));

      // if (this.velocity.x > 0.1) this.left = false;
      // else if (this.velocity.x < -0.1) this.left = true;
    }


    // advance animation frame if time to
    var anim = this.animation;
    anim.remainingTime -= interval;
    if (anim.remainingTime <= 0) {
      anim.frame = (this.animation.frame + 1) % this.animation.length;
      anim.remainingTime = (anim.frames[anim.frame][2] || defaultFrameMillis) + anim.remainingTime;
    }
  });
}

var setDrawFor = function (entity) {
  entity.on('draw', function (ctx) {
    var self = this;
    if (imagesLoaded) {
      drawWithCamera (ctx, function (context) {
        var drawScale = 1.1;
        var sprite = self.descriptor.sprite;
        var anim = self.animation;

        var w = sprite.width, h = sprite.height;
        var img = images[sprite.file];
        var frame = anim.frames[anim.frame];

        context.save();
        context.translate(self.position.x, self.position.y);
        if (self.left) {
          context.translate(self.size.x, 0);
          context.scale(-1, 1);
        }
        context.drawImage(img,
                    frame[0] * w, frame[1] * h, w, h,
                    0, 0, self.size.x * drawScale, self.size.y * drawScale);
        context.restore();
      });
    }
  });
}


var addEnemy = function (enemy, animationName) {
  enemy.startAnimation(animationName);
  enemy.addTo(game);
  setUpdateFor(enemy);
  setDrawFor(enemy);
};


var addBeetle = function (x, y) { 
  var beetle = new Enemy({
    descriptor: beetleDescriptor,
    position: { x: x, y: y },
    size: { x: 100, y: 100 },
    speed: 400,
    gravity: true
  });
  addEnemy(beetle, 'move');
  beetle.on('update', function (interval) {
    // random wander
    if (Math.random() < 0.01) {
      this.left = !this.left;
    }
    if (this.left) {
      this.velocity.x = 50;
    } else {
      this.velocity.x = -50;
    }
  });
}

addBeetle(610, 900);
addBeetle(1275, 880);
addBeetle(2980, 190);
addBeetle(3575, 270);

var addFrog = function(x, y) {
  var frog = new Enemy({
    descriptor: frogDescriptor,
    position: { x: x, y: y },
    size: { x: 100, y: 100 },
    speed: 400,
    gravity: true
  });
  addEnemy(frog, 'idle');
};

addFrog(1600, 650);
addFrog(2350, 650);
addFrog(2630, 510);
addFrog(2680, 520);



var addChipmunk = function (x, y) {
  var chipmunk1 = new Enemy({
    descriptor: chipmunkDescriptor,
    position: { x: x, y: y },
    size: { x: 100, y: 100 },
    speed: 400,
    gravity: true
  });
  addEnemy(chipmunk1, 'idle');
};

addChipmunk(1080, 580);
addChipmunk(1300, 700);

var addSquirrel = function (x, y) {
  var squirrel1 = new Enemy({
    descriptor: squirrelDescriptor,
    position: { x: x, y: y },
    size: { x: 100, y: 100 },
    speed: 400,
    gravity: true
  });
  addEnemy(squirrel1, 'move');
  return squirrel1;
};

addSquirrel(950, 50);
var squir = addSquirrel(1260, 339);
squir.left = true;

player.addTo(game);
