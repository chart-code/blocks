var fetchCache = require('./../lib/fetch-cache')
var mime = require('mime-types')


module.exports = async function get(req, res, next) {
  var {user, id, file} = req.params

  var url =`https://gist.githubusercontent.com/${user}/${id}/raw/${file}`

  try{
    var text = await fetchCache(url, 'text')
    if (file.includes('.html')) text = text.replace(/http:\/\//g, '//')

    res.writeHead('200', {
      'Content-Type': mime.lookup(file),
      'Cache-Control': 'public, max-age=' + 1000*60,
    })
    res.end(text)
  } catch(e){
    console.log('missing', e)
    res.writeHead('404')
    res.end('')
  }
}