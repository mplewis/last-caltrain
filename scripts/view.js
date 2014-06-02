$.timeago.settings.allowFuture = true;

var dom = {
  inputContainer: {
    origin: $('#station-origin'),
    dest: $('#station-dest'),
  },
  input: {
    origin: null,
    dest: null
  },
  static: {
    ticket: $('#ticket'),
    printButton: $('#button-print'),
    expiryText: $('.expiry'),
    zoneText: {
      origin: $('.zone-num.origin'),
      dest: $('.zone-num.dest')
    }
  }
};

var touched = {
  origin: null,
  dest: null
};

function populateDropdowns(stations, order) {
  var origins = $('<select>');
  order.forEach(function(stationId) {
    var stationName = stations[stationId].name;
    var option = $('<option>');
    option.val(stationId).text(stationName);
    origins.append(option);
  });
  dom.inputContainer.origin.append(origins);
  dom.inputContainer.dest.append(origins.clone());
  dom.input.origin = $(dom.inputContainer.origin.find('select')[0]);
  dom.input.dest = $(dom.inputContainer.dest.find('select')[0]);
}

function renderTime() {
  console.log(touched.origin, touched.dest);
  var time = getLastDepart(touched.origin, touched.dest, true);
  if (time) {
    var absTimeStr = moment(time).format("h:mm a");
    var relTimeStr = $.timeago(time);
    var timeStr = absTimeStr + ' (' + relTimeStr + ')';
    console.log(timeStr);
  } else {
    console.log('No trains available');
  }
}

function changeHandler(name) {
  touched[name] = dom.input[name].val();
  if (touched.origin && touched.dest) {
    renderTime();
  }
}

function bindInputs() {
  dom.input.origin.change(function() {
    changeHandler('origin');
  });
  dom.input.dest.change(function() {
    changeHandler('dest');
  });
  $('#button-print').click(function() {
    setTimeout(function() {
      setExpiryText(new Date());
      setZonesText(getOriginStation().zone, getDestStation().zone);
    }, 1000);
    var angle = randInt(-5, 5) + 'deg';
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
      .transition({y: 375, rotate: angle}, 500, 'easeOutExpo'); // spit it out
  });
}

function setOriginById(stationId) {
  dom.input.origin.val(stationId);
}

function setDestById(stationId) {
  dom.input.dest.val(stationId);
}

function getOriginStation() {
  var stationId = dom.input.origin.val();
  return stations[stationId];
}

function getDestStation() {
  var stationId = dom.input.dest.val();
  return stations[stationId];
}

function setExpiryText(targetDate) {
  var formatString = 'D MMM YY h:mm A';
  var boardText = 'BOARD ' + moment(targetDate).format(formatString).toUpperCase();
  dom.static.expiryText.text(boardText);
}

function setZonesText(origin, dest) {
  dom.static.zoneText.origin.text(origin);
  dom.static.zoneText.dest.text(dest);
}

function printTicket() {
  dom.static.printButton.click();
}
