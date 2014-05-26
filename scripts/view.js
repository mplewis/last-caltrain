$.timeago.settings.allowFuture = true;

var dom = {
  inputContainer: {
    origin: $('#station-origin'),
    dest: $('#station-dest'),
  },
  input: {},
  static: {
    ticket: $('#ticket')
  }
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

function bindInputs() {
  dom.input.origin.change(function() {
    changeHandler('origin');
  });
  dom.input.dest.change(function() {
    changeHandler('dest');
  });
  $('#button-print').click(function() {
    dom.static.ticket
      .clearQueue()
      .transition({opacity: 0}, 750, 'easeInOutSine') // fade out existing ticket
      .transition({y: 0, rotate: '0deg'}, 250) // move to start once ticket fades out
      .transition({opacity: 1}, 0) // fade back in once ticket is hidden
      .transition({y: 100}, 400, 'linear') // out
      .transition({y: 100}, 500, 'linear') // delay
      .transition({y: 80}, 200, 'linear') // in a bit
      .transition({y: 80}, 600, 'linear') // delay
      .transition({y: 175}, 600, 'linear') // out more
      .transition({y: 175}, 200, 'linear') // delay
      .transition({y: 200}, 500, 'linear') // out more
      .transition({y: 200}, 800, 'linear') // delay
      .transition({y: 375, rotate: '-5deg'}, 500, 'easeOutExpo'); // spit it out
  });
}
