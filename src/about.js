var fetch = require('node-fetch')
var _ = require('underscore')
var fs = require('fs')
var gists = require('./gists-static.js')

var e = _.escape

function generateHTML(){
  return `<!DOCTYPE html>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <link rel='stylesheet' href='style.css'>
  <title>blocks</title>
  <div class='username'>blocks</div>

  <p>github.com link</p
  `
}

module.exports = async function get(req, res, next) {
  var html = generateHTML()
  res.writeHead(200, {'Content-Type': 'text/html'})
  res.end(html)
}


if (require.main === module){
}