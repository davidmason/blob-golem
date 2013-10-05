var loadImages = require('image-batch-loader');

module.exports = function (game, map) {
  var allImagesLoaded = false;
  var images = {};

  loadImages(requiredImages(map), function (loadedImages) {
    images = loadedImages;
    allImagesLoaded = true;
  });

  game.on('draw-background', function (context) {
    if (allImagesLoaded) {
      context.drawImage(images[map.background.file], map.background.left, map.background.top);
      drawTileBackgrounds(context);
    }
  });

  function drawTileBackgrounds(context) {
    var toDraw = map.midground;
    var tiles = map.tiles;
    var name, x, y, w, h, img;

    for (var i = 0; i < toDraw.length; i++) {
      name = toDraw[i][0];
      img = images[tiles[name].background];
      x = toDraw[i][1][0];
      y = toDraw[i][1][1];
      w = tiles[name].width;
      h = tiles[name].height;
      context.drawImage(img, x, y, w, h);
    }
  }

};

function requiredImages (map) {
  var tileBackgroundFiles = [];
  tileBackgroundFiles.push(map.background.file);
  for (var tile in map.tiles) {
    tileBackgroundFiles.push(map.tiles[tile].background);
  }
  return tileBackgroundFiles;
}

// NOTE: this will also need to supply or handle collisions.
// could add a method to deal with that - either add a listener
// or have a method that takes a boundig box and indicates
// whether it collides with the map (and maybe which part of
// the bounding box collides in case of jumping up through platforms).