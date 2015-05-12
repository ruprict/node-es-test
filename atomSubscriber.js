var ges = require('ges-client')
  , uuid = require('node-uuid');


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

// 1) Create a connection to a running EventStore
// //    using default connection options and credentials
var connection = ges(options), 
                stream = 'orders';

     // 2) Create a subscription
connection.on('connect', function(message) {
  var subscription = connection.subscribeToStream(stream);
  console.log(message);

  // 3}) Listen for events
  subscription.on('event', function(evt) {
    console.log(5);
    // ta da!
    console.log(evt)
  })

  var newEvent = ges.createEventData(uuid.v4(), "OrderCreated", true,  {
      field: 'OrderNumber',
      value: '42'
    });
  console.log(1);
  var appendData = {
    expectedVersion: ges.expectedVersion.any,
    events: [newEvent]
  };
  console.log(2);
  connection.appendToStream(stream, appendData, function(err, appendResult) {
    if(err) return console.log('Ooops!', err); // connection error
    console.log('Append');
    console.log(appendResult);
  })
  console.log(3);
});
