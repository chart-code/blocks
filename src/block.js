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

  // console.log(d3.entries(gist.files).map(d => d.key))

  var files = d3.entries(gist.files)
    .filter(d => !d.value.trucated)
    .filter(d => d.value.size < 20000)
    .filter(d => d.key[0] != '.')
    .filter(d => d.key != 'README.md')
    .filter(d => !d.key.includes('.png'))

  files = _.sortBy(files, d => d.key.includes('index.js') || d.key.includes('script.js') ? -1 : 1)

  if (!gist.files) console.log('ERROR', gist)

  var iframeURL = `/${user}/raw/${id}/index.html`
  var rootURL = iframeURL.replace('index.html', '')

  return `<!DOCTYPE html>
  <meta charset='utf-8'>
  <link rel="icon" href="data:;base64,iVBORw0KGgo=">
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <link rel="stylesheet" href="/static/github-gist.min.css">
  <script src="/static/highlight.min.js"></script>
  <link rel='stylesheet' href='/static/style.css'>

  <title>${title}</title>
  <div class='username'>${titleURL}</div>

  <h1>${description}</h1>

  ${gist.files['index.html'] ?  
    `
    <a style='float: right; height: 0px; top: -23px; position: relative;'' href=${iframeURL}>Full Screen</a>
    <iframe width=960 height=500 scrolling='no' src='${iframeURL}'></iframe>`
    : ''
  }

  <div id='readme'>
    ${gist.files['README.md'] ? marked(gist.files['README.md'].content) : ''}
  </div>

  <div id='files'>${files.map(d =>
    `<div>
      <h3>${d.key}</h3>
      <pre><code class='lang-${d.value.language || d.key.split('.')[1]}'></code></pre>
    </div>`
  ).join('')}</div>

  <script>
    var rootURL = '${rootURL}'

    ;[...document.querySelectorAll('#files > div')].forEach(async d => {
      var file = d.querySelectorAll('h3')[0].textContent
      var text = await (await fetch(rootURL + file)).text()
      
      var codeEl = d.querySelectorAll('code')[0]
      codeEl.textContent = text
      hljs.highlightBlock(codeEl)
    })
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
