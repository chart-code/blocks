var io = require('indian-ocean')
var fs = require('fs')
var mime = require('mime-types')

var rootdir = __dirname + '/../static/'

var staticFiles = {}
io.readdirFilterSync(rootdir).forEach(d => {
  if (d.includes('DS_Store')) return
  staticFiles[d] = fs.readFileSync(rootdir + d, 'utf8')
})

module.exports = async function get(req, res, next) {
  var {file} = req.params

  res.writeHead('200', {
    'Content-Type': mime.lookup(file),
    'Cache-Control': 'public, max-age=' + 1000*60,
  })
  res.end(staticFiles[file])
}
