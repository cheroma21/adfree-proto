var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var socketio = require('socket.io');
var app = express();
var azure = require('azure');
var serviceBusService = azure.createServiceBusService();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/admin', routes.admin);
app.get('/users', user.list);

var server = http.createServer(app);

var io = socketio.listen(server);

var topic = 'WorkQueue';
var subscription = 'AllItems';

function sendDataToSocket(socket) {
  serviceBusService.receiveSubscriptionMessage(topic, subscription, { isPeekLock: true }, function(err, message) {
    if(err) throw err;
    socket.emit('process', message);
    //serviceBusService.unlockMessage(lockedMessage, function(err) {});
    //serviceBusService.deleteMessage(lockedMessage, function(err) {});
  });
}

var messageCount = 0;
var clients = 0;

function updateStats() {
  io.sockets.emit('mps', messageCount);
  io.sockets.emit('clients', clients);
  messageCount = 0;
}
var crimesInRange = 0;

setInterval(updateStats, 1000);

io.on('connection', function(socket) {
  socket.on('ready for job', function() {
    clients++;
    socket.emit('job', 'function process(message){function isInRange(origin,target,range){function toRad(deg){return deg*Math.PI/180}function getDistance(origin,target){var R=6371;var delta={lat:toRad(target.lat-origin.lat),lon:toRad(target.lon-origin.lon)};var start=toRad(origin.lat);var end=toRad(target.lat);var a=Math.sin(delta.lat/2)*Math.sin(delta.lat/2)+Math.sin(delta.lon/2)*Math.sin(delta.lon/2)*Math.cos(start)*Math.cos(end);var c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));return R*c}return getDistance(origin,target)<range}function parseData(data){var parts=data.split(",");return{lat:parts[parts.length-1],lon:parts[parts.length-2]}}var target=parseData(message.body);var origin={lat:37.769578,lon:-122.403663};var range=5;return isInRange(origin,target,range)?1:0}');
  });

  socket.on('ready for data', function() {
    socket.isClient = true;
    sendDataToSocket(socket);
  });

  socket.on('results', function(message, results) {
    messageCount++;
    crimesInRange += results;
  });
  
  socket.on('disconnect', function() {
    if(socket.isClient) {
      clients--;
    }
  });
});

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
