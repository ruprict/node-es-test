var EventStoreClient = require("event-store-client");

// Sample application to demonstrate how to use the Event Store Client
/*************************************************************************************************/
// CONFIGURATION
var config = {
    'eventStore': {
    	'address': "ec2-54-82-102-100.compute-1.amazonaws.com",
        'port': 1113,
        'stream': 'orders',
        'credentials': {
			'username': "admin",
			'password': "changeit"
        }
    },
    'debug': false
};
/*************************************************************************************************/

// Connect to the Event Store
var options = {
	host: config.eventStore.address,
	port: config.eventStore.port,
    debug: config.debug
};
console.log('Connecting to ' + options.host + ':' + options.port + '...');
var connection = new EventStoreClient.Connection(options);
console.log('Connected');

// Ping it to see that its there
connection.sendPing(function(pkg) {
    console.log('Received ' + EventStoreClient.Commands.getCommandName(pkg.command) + ' response!');
});

// Subscribe to receive statistics events
var streamId = config.eventStore.stream;
var credentials = config.eventStore.credentials;

var destinationId = "orders";
console.log('Writing events to ' + destinationId + '...');
var newEvent = {
    eventId: EventStoreClient.Connection.createGuid(),
    eventType: 'OrderCreated',
    data: {
        textProperty: "value",
        numericProperty: 42
    }
};
var newEvents = [ newEvent ];
function writeEvents() {
  connection.writeEvents(destinationId, EventStoreClient.ExpectedVersion.Any, false, newEvents, credentials, function(completed) {
      console.log('Events written result: ' + EventStoreClient.OperationResult.getName(completed.result));
  });
}

console.log('Subscribing to ' + streamId + "...");
var lastEvent = 26;
var correlationId = connection.subscribeToStream(streamId, true, function(streamEvent) {
    onEventAppeared(streamEvent);
}, onSubscriptionConfirmed, onSubscriptionDropped, credentials);

console.log("Correlation id: " +correlationId.toString());

function onEventAppeared(streamEvent) {
  if (streamEvent.eventNumber < lastEvent) {
    console.log("We've seen this one");
    return
  }
    if (streamEvent.streamId != streamId) {
        console.log("Unknown event from " + streamEvent.streamId);
        return;
    }
    console.log(streamEvent);
    console.log(streamEvent.data);
}

function unsub(){
    connection.unsubscribeFromStream(correlationId, credentials, function() {
        console.log("Unsubscribed");
    });
}

function closeConnection() {
        console.log("All done!");
        connection.close();
}

function onSubscriptionConfirmed(confirmation) {
    console.log("Subscription confirmed (last commit " + confirmation.lastCommitPosition + ", last event " + confirmation.lastEventNumber + ")");
}

function onSubscriptionDropped(dropped) {
    var reason = dropped.reason;
    switch (dropped.reason) {
        case 0:
            reason = "unsubscribed";
            break;
        case 1:
            reason = "access denied";
            break;
    }
    console.log("Subscription dropped (" + reason + ")");
}

process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    closeConnection();
    process.exit();
});

