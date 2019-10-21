var _ = require('underscore')
var polka = require('polka')

var about = require('./routes/about')
var user = require('./routes/user')
var block = require('./routes/block')
var raw = require('./routes/raw')
var static = require('./lib/static')
var fetchCache = require('./lib/fetch-cache')

var exec = require('await-exec')
var argv = require('minimist')(process.argv.slice(2))
var PORT = argv.port || 3002
var DEV = argv.dev


async function init(){
  polka()
    .get('/static/:file', (req, res) => {
      if (DEV) static = requireUncached('./lib/static')
      static(req, res)
    })
    .get('/cache-bust', (req, res) => {
      fetchCache.bust()
      res.writeHead(301, {Location: '/'})
    })
    .get('/', (req, res) => {
      if (DEV) about = requireUncached('./routes/about')
      about(req, res)
    })
    .get('/:user', (req, res) => {
      if (DEV) user = requireUncached('./routes/user')
      user(req, res)
    })
    .get('/:user/:id', (req, res) => {
      if (DEV) block = requireUncached('./routes/block')
      block(req, res)
    })
    .get('/:user/raw/:id/:file', (req, res) => {
      if (DEV) raw = requireUncached('./routes/raw')
      raw(req, res)
    })
    .listen(PORT, err => {
      if (err) throw err
      console.log(`http://localhost:${PORT}`)
      // exec(`open http://localhost:${PORT}`)
    })
}

init()


function requireUncached(module){
  delete require.cache[require.resolve(module)]
  return require(module)
}

