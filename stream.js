var es = require('event-stream'),
    fs = require('fs'),
    ps = es.pause(),
    azure = require('azure'),
    serviceBusService = azure.createServiceBusService();

var topic = 'WorkQueue';
var subscription = 'AllItems';

serviceBusService.receiveSubscriptionMessage(topic, subscription, { isPeekLock: true }, function(err, message) {
	if(err) throw err;
	console.log(message);
  
  //serviceBusService.unlockMessage(lockedMessage, function(err) {});
  //serviceBusService.deleteMessage(lockedMessage, function(err) {});
});
