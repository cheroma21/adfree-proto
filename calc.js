
function process(message) {
  function isInRange(origin, target, range) {
    function toRad(deg) {
      return deg * Math.PI / 180;
    }

    function getDistance(origin, target) {
      var R = 6371; // km
      var delta = {
        lat: toRad(target.lat - origin.lat),
        lon: toRad(target.lon - origin.lon)
      };

      var start = toRad(origin.lat);
      var end = toRad(target.lat);

      var a = Math.sin(delta.lat / 2) * Math.sin(delta.lat / 2) +
              Math.sin(delta.lon / 2) * Math.sin(delta.lon / 2) * 
              Math.cos(start) * Math.cos(end); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      
      return R * c;
    }

    return getDistance(origin, target) < range;
  }

  function parseData(data) {
    var parts = data.split(',');
    return { lat: parts[parts.length - 1], lon: parts[parts.length - 2] };
  }

  var target = parseData(message.data);
  var origin = { lat: 37.769578, lon: -122.403663 };
  var range = 5;

  return isInRange(origin, target, range) ? 1 : 0;
}
