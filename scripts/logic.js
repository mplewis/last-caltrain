var timetable;
var refDay;
var utcOffset = -7;

function initializeTimetable(tt) {
  timetable = tt;
  refDay = new Date();
  refDay.setUTCHours(-utcOffset, 0, 0, 0);
  console.log(refDay);
}

function getLastDepart(origin, dest, isWeekday) {
  var departOffset;
  if (isWeekday) {
    departOffset = timetable.weekday[origin][dest];
  } else {
    departOffset = timetable.weekend[origin][dest];
  }
  if (!departOffset) {
    return null;
  }
  var lastDepart = new Date(refDay.getTime());
  lastDepart.setSeconds(lastDepart.getSeconds() + departOffset);
  return lastDepart;
}
