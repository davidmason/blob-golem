var Game = require('crtrdg-gameloop'),
    Keyboard = require('crtrdg-keyboard'),
    Mouse = require('crtrdg-mouse'),
    Player = require('./entity/player'),
    Enemy = require('./entity/enemy'),
    loadImages = require('image-batch-loader'),
    loadSounds = require('./load-audio'),
    drawBigText = require('./draw-big-text'),
    GameTimer = require('./game-timer');

var imagesToLoad = ['images/entity/blob-concept.png'];

var addEntity = function (entityDescriptor) {
  imagesToLoad.push(entityDescriptor.sprite.file);
}

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
var keyboard = new Keyboard(game);
var mouse = new Mouse(game);

mouse.on('click', function(location){
  console.log("clicked at location (" + location.x + ", " + location.y + ")");
  if (soundsLoaded) {
    sounds['audio/effects/In_water'].play();
  }
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
  position: { x: 100, y: 100 },
  size: { x: 100, y: 100 },
  speed: 100
});
player.addTo(game);

player.on('update', function (interval) {
  var delta = (interval / 1000);
  this.keyboardInput(keyboard);
  this.move(this.velocity, delta);
});

player.on('draw', function (context) {
  context.fillStyle = "#337";
  context.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
});

player.on('collision', function (entity) {
  // Note: this plays a sound every frame
  // TODO add collision-start, collision-end
  if (soundsLoaded) {
    sounds['audio/effects/In_water'].play();
  }
});

var enemy = new Enemy({
  position: { x: 300, y: 300 },
  size: { x: 50, y: 50 },
  speed: 2
});
enemy.addTo(game);

enemy.on('update', function (interval) {
  this.move({ x: -2, y: -2});
  if (this.position.x < 0) this.position.x = game.width + this.position.x;
  if (this.position.y < 0) this.position.y = this.position.y + game.height;
});

enemy.on('draw', function (context) {
  context.fillStyle = "#733";
  context.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
});

enemy.on('collision', function (entity) {
  console.log("Got you!!!");
});

game.on('update', function (interval) {
});


// FIXME all this stuff should go in another class
var frenemy = new Enemy({
  descriptor: blob,
  position: { x: 460, y: 250 },
  speed: 1
});
frenemy.addTo(game);

frenemy.startAnimation('stationary');

var defaultFrameMillis = 100;

frenemy.on('update', function (interval) {

  this.position.x = ((this.position.x + interval / 2 + this.size.x) % (game.width + this.size.x)) - this.size.x;

  var anim = this.animation;
  var animName = anim.name;
  if (animName === 'leap' && anim.frame === anim.frames.length - 1) {
    this.startAnimation('stationary');
  } else if (anim.name === 'stationary' && this.position.x > 150 && this.position.x <= 200) {
    this.startAnimation('leap');
  }

  anim.remainingTime -= interval;
  if (anim.remainingTime <= 0) {
    anim.frame = (this.animation.frame + 1) % this.animation.length;
    anim.remainingTime = (anim.frames[anim.frame][2] || defaultFrameMillis) + anim.remainingTime;
  }
});

frenemy.on('draw', function drawFrenemy (context) {

  // TODO move all this to CustomEntity

  if (imagesLoaded) {

    var sprite = this.descriptor.sprite;
    var anim = this.animation;

    var w = sprite.width, h = sprite.height;
    var img = images[sprite.file];
    var frame = anim.frames[anim.frame];

    context.drawImage(img,
                frame[0] * w, frame[1] * h, w, h,
                this.position.x, this.position.y, this.size.x, this.size.y);
  }
});

game.on('draw', function (context) {
  var img;

  // just testing draw
  if (imagesLoaded) {
    img = images['images/entity/blob-concept.png'];
    context.drawImage(img, 0, 0);
    if (game.paused) drawBigText(context, game, "paused", 0.75);
    else drawBigText(context, game, "playing", gameTimer.throbber());
  } else {
    drawBigText(context, game, "loading", gameTimer.throbber);
  }

});