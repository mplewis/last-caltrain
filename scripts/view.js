$.timeago.settings.allowFuture = true;

var dom = {
  inputContainer: {
    origin: $('#station-origin'),
    dest: $('#station-dest')
  },
  input: {}
};

var touched = {
  origin: null,
  dest: null
};

function populateDropdowns(stations, order) {
  var origins = $('<select>');
  order.forEach(function(stationId) {
    var stationName = stations[stationId];
    var option = $('<option>');
    option.val(stationId).text(stationName);
    origins.append(option);
  });
  dom.inputContainer.origin.append(origins);
  dom.inputContainer.dest.append(origins.clone());
  dom.input.origin = $(dom.inputContainer.origin.find('select')[0]);
  dom.input.dest = $(dom.inputContainer.dest.find('select')[0]);
}

function renderTime(time) {
  if (time) {
    var absTimeStr = moment(time).format("h:mm a");
    var relTimeStr = $.timeago(time);
    var timeStr = absTimeStr + ' (' + relTimeStr + ')';
    console.log(timeStr);
  } else {
    console.log('No trains available');
  }
}

var changeHandler = function(name) {
  touched[name] = dom.input[name].val();
  if (touched.origin && touched.dest) {
    var lastDepart = getLastDepart(touched.origin, touched.dest, true);
    renderTime(lastDepart);
  }
};

function watchDropdowns() {
  dom.input.origin.change(function() {
    changeHandler('origin');
  });
  dom.input.dest.change(function() {
    changeHandler('dest');
  });
}