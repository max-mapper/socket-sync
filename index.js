var sublevel = require('level-sublevel')
var replicate = require('level-replicate/msgpack')
var levelup = require('level')
var websocket = require('websocket-stream')

module.exports = function(socket, opts) {
  var opts = opts || {}
  var db = sublevel(opts.db) || sublevel(levelup('data.db'))
  var replicator = opts.replicator || replicate(db, 'master', "MASTER-1")
  
  var stream = websocket(socket)
  stream.pipe(replicator.createStream({tail: true})).pipe(stream)
  stream.on('data', function(c) {
    console.log(c)
  })
}
