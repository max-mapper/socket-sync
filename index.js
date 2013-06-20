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
  
  var httpServer = opts.httpServer || doorknobServer(opts)
  var webSocketServer = opts.webSocketServer || new WebSocketServer({ noServer: true, clientTracking: false })
  var db = opts.db || sublevel(levelup('data.db'))
  var replicator = opts.replicator || replicate(db, 'master', "MASTER-1")
  
  httpServer.on('upgrade', function (req, socket, head) {
    console.log('on upgrade')
    httpServer.doorknob(req, res, function(err, profile) {
      if (err || !profile || !profile.email) return socket.end()
      webSocketServer.handleUpgrade(req, socket, head, function(conn) {
        console.log('upgraded socket, conn is open')
        var stream = websocket(conn)
        stream.pipe(replicator.createStream({tail: true})).pipe(stream)
        stream.on('data', function(c) {
          console.log(c)
        })
      })
    })
  })
  
  return {
    httpServer: httpServer,
    webSocketServer: webSocketServer,
    options: opts,
    replicator: replicator
  }
}
