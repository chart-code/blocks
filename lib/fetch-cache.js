var fetch = require('node-fetch')
var io = require('indian-ocean')
var d3 = require('d3')

var cache = {}

var token = io.readDataSync(process.env.HOME + '/.gistup.json').token
var defaultAuthorization = 'token ' + token

module.exports = async function(url, type, token=''){
  var key = [url, type, token].join(' ')
  if (cache[key]) return cache[key].res

  console.log(key)

  var Authorization = token ? 'token ' + token : defaultAuthorization 
  var res = await (await fetch(url, {headers: {Authorization}}))[type]()
  cache[key] = {res, time: new Date()}

  return res
}

!(async function(){
  // return // disable cache cleaning
  while (true){
    await sleep(60*1000)
    var time = new Date()
    for (key in cache){
      if (time - cache[key].time > 15*60*1000) delete cache[key]
    }
  }
})()

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

