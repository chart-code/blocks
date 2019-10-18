var io = require('indian-ocean')

var data = io.readDataSync('BrowserHistory.json')

console.log(data[0])