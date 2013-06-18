var WebSocketServer = require('ws').Server
var websocket = require('websocket-stream')
var http = require('http')
var path = require('path')
var doorknobServer = require('doorknob/server')
var sublevel = require('level-sublevel')
var replicate = require('level-replicate/msgpack')
var levelup = require('levelup')

module.exports = function(opts) {
  if (!opts) opts = { port: 8181 }
  
  var httpServer = opts.httpServer || doorknobServer(opts.port)
  var webSocketServer = opts.webSocketServer || new WebSocketServer({ noServer: true, clientTracking: false })
  var db = opts.db || sublevel(levelup('data.db'))
  var replicator = opts.replicator || replicate(db, 'master', "MASTER-1")
  
  httpServer.on('upgrade', function (req, socket, head) {
    console.log('on upgrade')
    var sessionID = httpServer.doorknob.persona.getId(req)
    if (!sessionID) return socket.end()
    webSocketServer.handleUpgrade(req, socket, head, function(conn) {
      console.log('opened connection')
      var stream = websocket(conn)
      stream.pipe(replicator.createStream({tail: true})).pipe(stream)
      stream.on('data', function(c) {
        console.log(c)
      })
    })
  })
  
  return {
    httpServer: httpServer,
    webSocketServer: webSocketServer,
    port: opts.port,
    replicator: replicator
  }
}
