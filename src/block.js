var fetchCache = require('./../lib/fetch-cache')
var _ = require('underscore')
var d3 = require('d3')

var e = _.escape

var hljs = require('highlight.js')
var marked = require('marked')
marked.setOptions({
  highlight: (code, lang) => hljs.highlight(lang || 'text', code).value,
  smartypants: true
})

function generateHTML(user, id, gist){
  // if (!gist.id) return console.log(gist.id)  
  if (!gist || !gist.files) return console.log('missing files')
    
  var description = e(gist.description || id.substr(0, 20))
  var title = `${description} by ${e(user)}`
  var titleURL = `
    <a href='/'>block</a> by 
    <a href='/${e(user)}'>${e(user)}</a> 
    <a href='http://gist.github.com/${id}'>${id}</a>`

  var files = d3.entries(gist.files)
    .filter(d => !d.value.trucated)
    .filter(d => d.value.size < 2000)

  files.forEach(d => d.code = 'tktk code')

  var readme = files.find(d => d.key == 'README.md')
  files = files.filter(d => d.key != 'README.md')

  if (!gist.files) console.log('ERROR', gist)

  return `<!DOCTYPE html>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <link rel='stylesheet' href='/static/style.css'>
  <title>${title}</title>
  <div class='username'>${titleURL}</div>

  <h1>${description}</h1>

  ${!gist.files['index.html'] ? '' : 
    `<iframe width=960 height=500 src='/${user}/raw/${id}/index.html'></iframe>`
  }

  ${readme ? marked(readme.value.content) : ''}

  ${files.map(file => `
    <h3>${file.key}</h3>
    <pre><code>${file.value.content}</code></pre>
  `).join('')}

  <script>

  </script>
  `
}

module.exports = async function get(req, res, next) {
  var {user, id} = req.params
  var url = `https://api.github.com/gists/${id}`
  var gist = await fetchCache(url, 'json')

  var html = generateHTML(user, id, gist)

  res.writeHead(200, {'Content-Type': 'text/html'})
  res.end(html)
}


if (require.main === module){
}
