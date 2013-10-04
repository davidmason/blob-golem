module.exports = function drawLoading (context, game, opacity) {
  // display "loading" until all images are loaded

  context.font = "80px Helvetica";
  context.textAlign = "center";
  context.fillStyle = "rgba(0, 0, 0, " + opacity + ")";
  context.fillText("Loading", game.width / 2, game.height/2);
}