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

var imagesToLoad = ['images/entity/blob-concept.png'];

var addEntity = function (entityDescriptor) {
  imagesToLoad.push(entityDescriptor.sprite.file);
}

var defaultFrameMillis = 100;

var blob = require('./../entities/blob.json');
addEntity(blob);

var images = {};
var imagesLoaded = false;

loadImages(imagesToLoad, function(loadedImages) {
  images = loadedImages;
  imagesLoaded = true;
  console.log("loaded all images");
});

var sounds = {};
var soundsLoaded = false;
loadSounds(['audio/effects/In_water'], function (loadedSounds) {
  sounds = loadedSounds;
  soundsLoaded = true;
  console.log("loaded all sounds");
});

var game = new Game({
  canvas: 'main-canvas',
  width: 1200,
  height: 650,
  backgroundColor: '#6cf'
});

// appears not to be possible to pass in a string to use for require
var map = require('./../maps/testmap.json');
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
  position: { x: 400, y: -2000 },
  size: { x: 100, y: 100 },
  speed: 400,
  gravity: true
});
player.addTo(game);

player.startAnimation('stationary');

player.on('update', function (interval) {
  if (level.loaded) {
    this.fixVelocity();

    var newPos = this.checkMove(this.velocity, (interval / 1000));
    if (level.checkCollision(newPos)) {
      // FIXME should move as far as possible
      this.velocity.x = 0;
      this.velocity.y = 0;

      // check needed or it stays on first frame
      if (this.jumping) { this.startAnimation('stationary'); }
      this.jumping = false;
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

player.on('draw', function (context) {
  if (imagesLoaded) {
    var playerScale = 1.1;
    var sprite = this.descriptor.sprite;
    var anim = this.animation;

    var w = sprite.width, h = sprite.height;
    var img = images[sprite.file];
    var frame = anim.frames[anim.frame];

    context.save();
    context.translate(this.position.x, this.position.y);
    if (this.left) {
      context.translate(this.size.x, 0);
      context.scale(-1, 1);
    }
    context.drawImage(img,
                frame[0] * w, frame[1] * h, w, h,
                0, 0, this.size.x * playerScale, this.size.y * playerScale);
                // this.position.x, this.position.y, this.size.x, this.size.y);
    context.restore();
  }
});

player.on('collision', function (entity) {
  // Note: this plays a sound every frame
  // TODO add collision-start, collision-end
  if (soundsLoaded) {
    // sounds['audio/effects/In_water'].play();
  }
});


game.on('draw', function (context) {
  if (imagesLoaded) {
    if (game.paused) drawBigText(context, game, "paused", 0.75);
  } else {
    drawBigText(context, game, "loading", gameTimer.throbber);
  }

});