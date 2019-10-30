var fetchCache = require('./../lib/fetch-cache')
var io = require('indian-ocean')
var _ = require('underscore')
var d3 = require('d3')

var e = _.escape

async function dlGists(user, token='', maxPages=11){
  var responces = []
  var responce = null
  var page = 1
  do {
    var url = `https://api.github.com/users/${user}/gists?page=${page}&per_page=100`
    var responce = await fetchCache(url, 'json', token)
    responces.push(responce)
    page++
  } while (responce.length == 100 && page < maxPages)

  return _.flatten(responces)
    .map(({id, description, public}) => ({id, description, public}))
    .filter(d => d.id)
}

async function getGists(user, token){
  var path = __dirname + '/../usercache/' + user + token + '.csv'

  var cachedGists = []
  var maxPages = 0
  try {
    cachedGists = io.readDataSync(path)
  } catch (e) {
    maxPages = 11
  }

  // misses gists if someone makes a 100+ gists between caches
  var gists = await dlGists(user, token, maxPages)

  var isId = {}
  gists.forEach(d => isId[d.id] = true)

  cachedGists.forEach(d => isId[d.id] ? '' : gists.push(d))

  // download & save full list of gists after making request 
  !(async function(){
    var currentGists = await dlGists(user, token)
    if (currentGists.length > 0) io.writeData(path, currentGists, d => d)
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

  <div id='gist-list'>
  ${gists.filter(d => d && d.id).map(gist => `
    <a class="block-thumb ${gist.public ? '' : 'block-private'}"
      style="background-position: center; background-image:url('https://gist.githubusercontent.com/${user}/${gist.id}/raw/thumbnail.png')"
      href="/${user}/${gist.id}">
      <p>${gist.public ? '' : '🔒 '}${e(gist.description || gist.id.substr(0, 20))}</p>
    </a>
  `).join(' ')}
  </div>
  `
}

module.exports = async function get(req, res, next) {
  var user = req.params.user
  var token = req.query.token || ''
  var gists = await getGists(req.params.user, token)

  // redirect if user doesn't exist and there's a gist id with their user name
  // /397f1b0905400b83fcea4008fb4ccdb1 -> /1wheel/397f1b0905400b83fcea4008fb4ccdb1
  if (!gists.length){
    var url = `https://api.github.com/gists/${user}`
    var gist = await fetchCache(url, 'json')

    if (gist && gist.owner){
      res.writeHead(301, {Location: `/${gist.owner.login}/${user}`})
      return res.end('')
    }
  }

  var html = generateHTML(user, gists)
  res.writeHead(200, {'Content-Type': 'text/html'})
  res.end(html)
}
