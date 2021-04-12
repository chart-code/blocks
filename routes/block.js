var fetchCache = require('./../lib/fetch-cache')
var _ = require('underscore')
var d3 = require('d3')

var e = _.escape

var hljs = require('highlight.js')
var marked = require('marked')
marked.setOptions({
  highlight: (code, lang) => {
    var obj = lang ? hljs.highlight(lang, code) : hljs.highlightAuto(code)
    return obj.value
  },
  smartypants: true
})

async function generateHTML(user, id, gist, query){
  if (!gist || !gist.files) return console.log('missing files')

  d3.keys(gist.files).forEach(key => {
    if (key.toLowerCase() != 'readme.md' || gist.files['README.md']) return

    gist.files['README.md'] = gist.files[key]
    delete gist.files[key]
  })
    
  var description = e(gist.description || id.substr(0, 20))
  var title = `${description} by ${e(user)}`
  var titleURL = `
    <a href='/'>block</a> by 
    <a href='/${e(user)}'>${e(user)}</a> 
    <a href='http://gist.github.com/${id}'>${id}</a>`

  var files = d3.entries(gist.files)
    .filter(d => d.value.size < 20000)
    .filter(d => d.key[0] != '.')
    .filter(d => d.key != 'README.md')
    .filter(d => !d.key.includes('.png'))

  files = _.sortBy(files, d => d.key.includes('index.js') || d.key.includes('script.js') ? -2 : d.key.includes('index.html') ? -1 : 1)

  if (!gist.files) console.log('ERROR', gist)

  var iframeURL = `/${user}/raw/${id}/index.html`
  var rootURL = iframeURL.replace('index.html', '')

  // README.md is sometimes trucated; load seperately if it is
  if (gist.files['README.md'] && gist.files['README.md'].truncated){
    var url =`https://gist.githubusercontent.com/${user}/${id}/raw/README.md`
    gist.files['README.md'].content = await fetchCache(url, 'text')
  }

  var settings = {
    height: 500,
    scrolling: false,
    border: true,
    redirect: '',
  }
  if (gist.files['.block']){
    if (gist.files['.block'].truncated){
      var url =`https://gist.githubusercontent.com/${user}/${id}/raw/.block`
      gist.files['.block'].content = await fetchCache(url, 'text')
    }

    gist.files['.block'].content.split('\n')
      .filter(d => d && d.includes(': '))
      .forEach(line => {
        var [key, value] = line.split(': ')
        settings[key] = value == 'no' ? false : value
      })
  }

  d3.entries(query).forEach(({key, value}) => {
    if (value == 'no' || value == 'false' || value == '0') value = false
    settings[key] = value
  })

  return `<!DOCTYPE html>
  <meta charset='utf-8'>
  <link rel="icon" href="data:;base64,iVBORw0KGgo=">
  <meta property="og:title" content="${description}">
  <meta property="og:description" content="Block by ${e(user)}">
  ${
    gist.files['preview.png'] ? 
    `<meta property="og:image" content="https://gist.githubusercontent.com/${user}/${id}/raw/preview.png">
    <meta name="twitter:card" content="summary_large_image">`
    : ''
  }

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
    <iframe 
      style='${settings.border ? 'outline: 1px solid #ccc' : ''}' 
      width=960 
      height=${settings.height} 
      scrolling='${settings.scrolling ? '' : 'no'}' 
      src='${iframeURL}'>
    </iframe>`
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
  var html = await generateHTML(user, id, gist, req.query)

  res.writeHead(200, {'Content-Type': 'text/html'})
  res.end(html)
}
