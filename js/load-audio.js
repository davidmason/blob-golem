var AudioFX = require('audio-fx');

module.exports = function (audioPaths, callback) {
  console.log('loading audio');
  var sounds = {};
  var allLoaded = false;
  var toLoad = audioPaths.length;
  for (var i=0; i < audioPaths.length; i++) {
    // FIXME reload is not good in Firefox, add browser switch.
    // FIXME specify pool count in input paths
    var sound = AudioFX(audioPaths[i], { formats: ['wav', 'mp3'], reload: true, pool: 5, volume: 1.0 }, function() {
      toLoad -= 1;
      allLoaded = toLoad == 0;
      if (allLoaded) {
        callback(sounds);
      }
    });
    sounds[audioPaths[i]] = sound;
  }
};