var Game = require('crtrdg-gameloop'),
    Keyboard = require('crtrdg-keyboard'),
    Mouse = require('crtrdg-mouse'),
    Player = require('./entity/player'),
    Enemy = require('./entity/enemy'),
    loadImages = require('./load-images'),
    drawBigText = require('./draw-big-text'),
    GameTimer = require('./game-timer');

// FIXME group modules together soon

var images = {};
var imagesLoaded = false;

loadImages(['images/entity/blob-concept.png'], function(loadedImages) {
  images = loadedImages;
  imagesLoaded = true;
  console.log("loaded all images");
});

var game = new Game({
  canvas: 'main-canvas',
  width: 1200,
  height: 650,
  backgroundColor: '#4eadfe'
});
var keyboard = new Keyboard(game);
var mouse = new Mouse(game);

mouse.on('click', function(location){
  console.log("clicked at location (" + location.x + ", " + location.y + ")");
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
  console.log("Ouch!");
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