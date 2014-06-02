function getLocation(callback) {
  if (Modernizr.geolocation) {
    navigator.geolocation.getCurrentPosition(callback);
  } else {
    callback();
  }
}
