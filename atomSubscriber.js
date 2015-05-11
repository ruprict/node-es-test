/**
 * Tips
 * ====
 * - Set `user-agent` and `accept` headers when sending requests. Some services will not respond as expected without them.
 * - Set `pool` to false if you send lots of requests using "request" library.
 */

var http = require('client-http');

function fetch(feed) {
  // Some feeds do not respond without user-agent and accept headers.
  http.request(feed, function(data, err, cookie, headers){
    if (err) {
      console.log(err);
      return;
    }
    
    json = JSON.parse(data);
    json["entries"].forEach(function(entry) {
      console.log(entry.data); 
    });

  }, null, {"Accept": "application/vnd.eventstore.atom+json", "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36"});
}

function maybeTranslate (res, charset) {
  var iconv;
  // Use iconv if its not utf8 already.
  if (!iconv && charset && !/utf-*8/i.test(charset)) {
    try {
      iconv = new Iconv(charset, 'utf-8');
      console.log('Converting from charset %s to utf-8', charset);
      iconv.on('error', done);
      // If we're using iconv, stream will be the output of iconv
      // otherwise it will remain the output of request
      res = res.pipe(iconv);
    } catch(err) {
      res.emit('error', err);
    }
  }
  return res;
}

function getParams(str) {
  var params = str.split(';').reduce(function (params, param) {
    var parts = param.split('=').map(function (part) { return part.trim(); });
    if (parts.length === 2) {
      params[parts[0]] = parts[1];
    }
    return params;
  }, {});
  return params;
}

function done(err) {
  if (err) {
    console.log(err, err.stack);
    return process.exit(1);
  }
  //server.close();
  process.exit();
}

// Don't worry about this. It's just a localhost file server so you can be
// certain the "remote" feed is available when you run this example.
fetch('http://ec2-54-82-102-100.compute-1.amazonaws.com:2113/streams/orders?embed=body');
