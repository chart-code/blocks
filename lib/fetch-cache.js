var fetch = require('node-fetch')
var io = require('indian-ocean')
var d3 = require('d3')

var cache = {}

var defaultAuthorization = 'token ' + token

try{
  console.log(process.env.HOME + '/.gistup.json')
  var token = io.readDataSync(process.env.HOME + '/.gistup.json').token
  defaultAuthorization = 'token ' + token
} catch (e){
  console.log('.gistup.json not found. create one to view your private gists https://github.com/mbostock/gistup')
}

module.exports = async function(url, type, token=''){
  var key = [url, type, token].join(' ')

  // Caching disabled - low traffic and OOM errors
  // if (cache[key]) return cache[key].res

  console.log(key)

  var Authorization = token ? 'token ' + token : defaultAuthorization 
  var res = await (await fetch(url, {headers: {Authorization}}))[type]()
  cache[key] = {res, time: new Date()}

  return res
}

module.exports.bust = () => {
  cache = {}
  console.log('cache bust')
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

