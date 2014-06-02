function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function lineDistance(point1x, point1y, point2x, point2y) {
  var xs = 0;
  var ys = 0;

  xs = point2x - point1x;
  xs = xs * xs;

  ys = point2y - point1y;
  ys = ys * ys;

  return Math.sqrt(xs + ys);
}
