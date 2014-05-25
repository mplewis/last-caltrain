var config;

$('document').ready(function(){
  $.getJSON('data/config.json', function(data) {
    config = data;
    $.getJSON('data/caltrain.json', function(data) {
      populateDropdowns(data.stations, data.stationDisplayOrder);
      initializeTimetable(data.latestDepartures);
      watchDropdowns();
    });
  });
});
