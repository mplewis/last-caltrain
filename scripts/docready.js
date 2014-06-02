var stations;

$('document').ready(function(){
  fetchConfig(function(configData) {
    var config = configData;
    fetchCaltrainData(function(caltrainData) {
      stations = caltrainData.stations;
      populateDropdowns(stations, caltrainData.stationDisplayOrder);
      initializeTimetable(caltrainData.latestDepartures);
      bindInputs();
      // $('#button-print').click();
      getLocation(function(position) {
        if (position) {
          var currLat = position.coords.latitude;
          var currLng = position.coords.longitude;
          var stationsByDist = _.pairs(stations).sort(function(firstPair, secondPair) {
            var first = firstPair[1];
            var second = secondPair[1];
            var firstDist = lineDistance(first.lat, first.lng, currLat, currLng);
            var secondDist = lineDistance(second.lat, second.lng, currLat, currLng);
            return firstDist - secondDist;
          });
          var closestStationPair = stationsByDist[0];
          var closestId = closestStationPair[0];
          var closestStation = closestStationPair[1];
          console.log('Closest station:', closestStation.name);
          setOriginById(closestId);
          if (closestId === config.geolocDest.default) {
            setDestById(config.geolocDest.fallback);
          } else {
            setDestById(config.geolocDest.default);
          }
          touched.origin = getOriginStation().id;
          touched.dest = getDestStation().id;
          renderTime();
          printTicket();
        } else {
          console.log('No geolocation available.');
        }
      });
    });
  });
});
