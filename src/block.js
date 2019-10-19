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

  var iframeURL = `/${user}/raw/${id}/index.html`
  var rootURL = iframeURL.replace('index.html', '')

  return `<!DOCTYPE html>
  <meta charset='utf-8'>
  <link rel="icon" href="data:;base64,iVBORw0KGgo=">
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <link rel='stylesheet' href='/static/style.css'>
  <script src='/static/d3_.js'></script>

  <title>${title}</title>
  <div class='username'>${titleURL}</div>

  <h1>${description}</h1>

  ${!gist.files['index.html'] ? '' : 
    `<iframe width=960 height=500 src='${iframeURL}'></iframe> <a style='float: right;' href=${iframeURL}>raw</a>`
  }

  ${readme ? marked(readme.value.content) : ''}

  <div id='files'></div>

  <script>
    var files = ${JSON.stringify(files.map(d => d.key))}

    d3.select('#files').appendMany('div', files)
      .append('h3').text(d => d)
      .parent()
      .append('pre')
      .each(async function(d){
        var str = await (await fetch('${rootURL}' + d)).text()

        d3.select(this).html(_.escape(str))
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
