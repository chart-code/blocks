var fetch = require('node-fetch')
var _ = require('underscore')
var fs = require('fs')
var gists = require('./gists-static.js')
var mime = require('mime-types')

var e = _.escape

function generateHTML(){
  return `<p>yo i am an iframe</p
  `
}

module.exports = async function get(req, res, next) {
  var {user, id, file} = req.params

  var url =`https://gist.githubusercontent.com/${user}/${id}/raw/${file}`
  var fetchRes = await fetch(url)
  var fetchText = await fetchRes.text() // TODO figure how to to stream this

  res.writeHead(fetchRes.status, {'Content-Type': mime.lookup(file)})
  res.end(fetchText)
}


if (require.main === module){
}