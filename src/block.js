var fetch = require('node-fetch')
var _ = require('underscore')
var fs = require('fs')
var d3 = require('d3')

var e = _.escape

function generateHTML(user, id, gist){
  var title = e(user) + `’s block ` + id


  var files = d3.entries(gist.files)
    .filter(d => !d.value.trucated)
    .filter(d => d.key != 'README.md')
    .filter(d => d.value.size < 2000)
    // .filter(d => d.value.type.include('image'))

  files.forEach(d => d.code = 'tktk code')

  console.log(gist)
  // var readme = gist.files['README.md']

  return `<!DOCTYPE html>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <link rel='stylesheet' href='/style.css'>
  <title>${title}</title>
  <div class='username'>${title}</div>

  <iframe width=960 height=500 src='/${user}/raw/${id}/index.html'></iframe>

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
  var gist = await (await fetch(url)).json()

  var html = generateHTML(user, id, gist)

  res.writeHead(200, {'Content-Type': 'text/html'})
  res.end(html)
}


if (require.main === module){
}