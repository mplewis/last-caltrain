function fetchConfig(callback) {
  $.getJSON('data/config.json', callback);
}

function fetchCaltrainData(callback) {
  $.getJSON('data/caltrain.json', callback);
}
