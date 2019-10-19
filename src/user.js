var fetchCache = require('./../lib/fetch-cache')
var cachedGists = require('./gists-static.js')
var io = require('indian-ocean')
var _ = require('underscore')
var d3 = require('d3')

var e = _.escape

async function dlGists(user, maxPages=11){
  var responces = []
  var responce = null
  var page = 1
  do {
    var url = `https://api.github.com/users/${user}/gists?page=${page}&per_page=100`
    var responce = await fetchCache(url, 'json')
    responces.push(responce)
    page++
  } while (responce.length == 100 && page < maxPages)

  return _.flatten(responces)
    .map(({id, description}) => ({id, description}))
}

async function getGists(user){
  var path = __dirname + '/../usercache/' + user + '.csv'

  var cachedGists = []
  var maxPages = 0
  try {
    cachedGists = io.readDataSync(path)
  } catch (e) {
    maxPages = 11
  }

  // misses gists if someone makes a 100+ gists between caches
  var gists = await dlGists(user, maxPages)

  var isId = {}
  gists.forEach(d => isId[d.id] = true)

  cachedGists.forEach(d => isId[d.id] ? '' : gists.push(d))

  // download & save full list of gists after making request 
  !(async function(){
    var currentGists = await dlGists(user)
    io.writeData(path, currentGists, d => d)
  })()

  return gists
}

function generateHTML(user, gists){
  var title =  `blocks by ${e(user)}`
  var titleURL =  `<a href='/'>blocks</a> by  ${e(user)}`

  return `<!DOCTYPE html>
  <meta charset='utf-8'>
  <link rel="icon" href="data:;base64,iVBORw0KGgo=">
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <link rel='stylesheet' href='/static/style.css'>
  <title>${title}</title>
  <div class='username'>${titleURL}</div>

  ${gists.filter(d => d && d.id).map(gist => `
    <a class="block-thumb" target="x_blank" 
      style="background-image:url('https://gist.githubusercontent.com/${user}/${gist.id}/raw/thumbnail.png')"
      href="/${user}/${gist.id}">
      <p>${e(gist.description || gist.id.substr(0, 20))}</p>
    </a>
  `).join(' ')}
  `
}

module.exports = async function get(req, res, next) {
  var user = req.params.user
  var gists = await getGists(req.params.user)
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