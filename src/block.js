var fetch = require('node-fetch')
var _ = require('underscore')
var fs = require('fs')
var d3 = require('d3')
var io = require('indian-ocean')

var e = _.escape

var token = io.readDataSync(process.env.HOME + '/.gistup.json').token
var Authorization = 'token ' + token

var hljs = require('highlight.js')
var marked = require('marked')
marked.setOptions({
  highlight: (code, lang) => hljs.highlight(lang, code).value,
  smartypants: true
})

function generateHTML(user, id, gist){
  var title = e(user) + `’s block ` + id

  var files = d3.entries(gist.files)
    .filter(d => !d.value.trucated)
    .filter(d => d.value.size < 2000)

  files.forEach(d => d.code = 'tktk code')

  var readme = files.find(d => d.key == 'README.md')
  files = files.filter(d => d.key != 'README.md')

  if (!gist.files) console.log('ERROR', gist)

  console.log(files)

  return `<!DOCTYPE html>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <link rel='stylesheet' href='/style.css'>
  <title>${title}</title>
  <div class='username'>${title}</div>

  <iframe width=960 height=500 src='/${user}/raw/${id}/index.html'></iframe>

  ${readme ? marked(readme.value.content) : ''}

  ${files.map(file => `
    <h2>${file.key}</h2>
    <pre><code>${file.value.content}</code></pre>
  `).join('')}

  <script>

  </script>
  `
}

module.exports = async function get(req, res, next) {
  var {user, id} = req.params
  var url = `https://api.github.com/gists/${id}`
  var gist = await (await fetch(url, {headers: {Authorization}})).json()

  var html = generateHTML(user, id, gist)

  res.writeHead(200, {'Content-Type': 'text/html'})
  res.end(html)
}


if (require.main === module){
}

// "Authorization": "token " + token,
// "User-Agent": "mbostock/gistup",
