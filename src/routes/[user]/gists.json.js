var r2 = require('r2')
var _ = require('underscore')
var fs = require('fs')

import gists from './gists.js';

async function dlGist(user){
  var responces = []
  var page = 1
  do {
    var url = `https://api.github.com/users/${user}/gists?page=${page}&per_page=100`
    console.log(url)
    responces.push(await r2(url).json)
    page++
  } while (_.last(responces).trucated && page < 11)

  var gists = _.flatten(responces)
    .map(({id, description}) => ({id, description}))
}

export async function get(req, res, next) {
  // var outGists = await dlGist(req.params.user)
  var outGists = gists.map(({id, description}) => ({id, description}))

  // res.header('Access-Control-Allow-Origin', '*') 
  // res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')

  res.writeHead(200, {
    'Content-Type': 'application/json'
  })

  res.end(JSON.stringify(outGists))
}




