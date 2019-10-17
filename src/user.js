var fetch = require('node-fetch')
var _ = require('underscore')
var cachedGists = require('./gists-static.js')

var e = _.escape

async function dlGists(user){
  var responces = []
  var responce = null
  var page = 0
  do {
    var url = `https://api.github.com/users/${user}/gists?page=${page}&per_page=100`
    var responce = await (await fetch(url)).json()
    responces.push(responce)
    page++
  } while (responce.length == 100 && page < 11)

  return _.flatten(responces)
    .map(({id, description}) => ({id, description}))
}

function generateHTML(user, gists){
  var title =  `blocks by ${e(user)}`
  var titleURL =  `<a href='/'>blocks</a> by  ${e(user)}`

  return `<!DOCTYPE html>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <link rel='stylesheet' href='/static/style.css'>
  <title>${title}</title>
  <div class='username'>${titleURL}</div>

  ${gists.filter(d => d && d.id).map(gist => `
    <a class ="block-thumb" target="_blank" 
      style="background-image:url('https://gist.githubusercontent.com/${user}/${gist.id}/raw/thumbnail.png')"
      href="/${user}/${gist.id}">
      <p>${e(gist.description || gist.id.substr(0, 20))}</p>
    </a>
  `).join(' ')}
  `
}

module.exports = async function get(req, res, next) {
  var user = req.params.user
  var gists = await dlGists(req.params.user)
  // var gists = cachedGists.map(({id, description}) => ({id, description}))
  var html = generateHTML(user, gists)

  res.writeHead(200, {'Content-Type': 'text/html'})
  res.end(html)
}


if (require.main === module){
  async function init(){
    // var myGists = await dlGists('1wheel')
  }

  init()
}