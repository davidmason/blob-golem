var loadImages = require('image-batch-loader'),
    aabb = require('aabb-2d');

module.exports = Map;

// module.exports = function (game, map) {
function Map(game, map) {
  var allImagesLoaded = false;
  var images = {};
  this.bounds = [];
  recordBounds(this.bounds);

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

  function requiredImages () {
    var tileBackgroundFiles = [];
    tileBackgroundFiles.push(map.background.file);
    for (var tile in map.tiles) {
      tileBackgroundFiles.push(map.tiles[tile].background);
    }
    return tileBackgroundFiles;
  }

  function recordBounds (bounds) {
    // actually need to look up tiles for each midground thing
    var tilePlacing = map.midground;
    var tiles = map.tiles;

    var name, x, y, w, h, bnds;

    for (var i = 0; i < tilePlacing.length; i++) {

      name = tilePlacing[i][0];
      x = tilePlacing[i][1][0];
      y = tilePlacing[i][1][1];
      w = map.tiles[name].width;
      h = map.tiles[name].height;

      bnds = map.tiles[name].bounds;

      var bbox;
      if (bnds) {
        bbox = aabb([x + bnds.x, y + bnds.y], [bnds.width, bnds.height]);
      } else {
        bbox = aabb([x, y], [w, h]);
      }

      bounds.push(bbox);
    }
  }

  return this;
}

Map.prototype.checkCollision = function (boundingBox) {
  for (var i = 0; i < this.bounds.length; i++) {
    if (this.bounds[i].intersects(boundingBox)) {
      return true; // FIXME other details
    }
  }
  return false; // FIXME other details
}
