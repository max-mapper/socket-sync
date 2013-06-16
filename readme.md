# socket-sync

convenience library that offers an easy API for bidirectional replication of large data sets (binary or ascii) between node and web browsers using authenticated websockets

required components (implemented by default or you can pass your own in): http server, websocket server, [level-replicate](https://github.com/dominictarr/level-replicate) instance

uses [ws](https://npmjs.org/package/ws) for server websocket connections and [doorknob](https://github.com/maxogden/doorknob) as the default http server + session store

## test it out locally

1. clone this repo
2. npm install
3. npm test

## license

BSD