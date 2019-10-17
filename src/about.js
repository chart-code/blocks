function generateHTML(){
  var people = '1wheel armollica denisemauldin blacki dwtkns enjalot gka jasondavies kennelliott mbostock monfera robinhouston tophtucker veltman emeeks zanarmstrong nbremer'
    .split(' ').sort()

  return `<!DOCTYPE html>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <link rel='stylesheet' href='/static/style.css'>
  <title>blocks</title>
  <div class='username'>blocks</div>

  <p><a href='github.com'>Open source</a> clone of <a href='https://bl.ocks.org/-/about'>bl.ocks.org</a>. Get started with <a href='https://bost.ocks.org/mike/block/'>Let’s Make a Block</a> and <a href='https://github.com/1wheel/d3-init'>d3-init</a>.

  <p>${people.map(d => `
    <a href='/${d}'>${d}</a><br>
    `).join('')}
  `
}

module.exports = async function get(req, res, next) {
  var html = generateHTML()
  res.writeHead(200, {'Content-Type': 'text/html'})
  res.end(html)
}


if (require.main === module){
}