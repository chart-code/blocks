var fetch = require('node-fetch')
var mime = require('mime-types')

module.exports = async function get(req, res, next) {
  var {user, id, file} = req.params

  var url =`https://gist.githubusercontent.com/${user}/${id}/raw/${file}`
  var fetchRes = await fetch(url)
  var fetchText = await fetchRes.text() // TODO figure how to to stream this

  res.writeHead(fetchRes.status, {'Content-Type': mime.lookup(file)})
  res.end(fetchText)
}


if (require.main === module){
}