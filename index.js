var inspect = require('eyespect').inspector();
var EventEmitter = require('events').EventEmitter;
var propagit = require('propagit')
var rk = require('required-keys');
module.exports = function (data, cb) {
  var keys = ['host', 'port', 'secret']
  var err = rk.truthySync(data, keys)
  if (err) {
    return cb({
      message: 'error getting json output from fleet, missing key in data',
      error: err,
      stack: new Error().stack
    })
  }
  var host = data.host
  var port = data.port
  var secret = data.secret
  var hub = [host, port].join(':')
  var propData = {
    hub: host + ':' + port,
    secret: secret
  }
  var p = propagit(propData)
  p.hub.on('up', function (hub) {
    var em = new EventEmitter
    var output = {}
    em.on('data', function (key, procs) {
      output[key] = procs
    });

    em.on('end', function () {
      p.hub.close();
      cb(null, output)
    });
    hub.ps(em.emit.bind(em));
  })
}
