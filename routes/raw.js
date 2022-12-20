const fetch = require("node-fetch");
const fetchCache = require("./../lib/fetch-cache");
const mime = require("mime-types");

console.log(mime.lookup('asdfasdf'))

module.exports = async function get(req, res, next) {
  const { user, id, file } = req.params;

  const url = `https://gist.githubusercontent.com/${user}/${id}/raw/${file}`;
  try {
    const type = mime.lookup(file) || '';
    if (type.match(/^image/)) {
      fetch(url).then(async (resp) => {
        resp.headers.forEach((v, n) => res.setHeader(n, v));
        resp.body.pipe(res);
      });
    } else {
      let text = await fetchCache(url, "text");
      if (file.includes(".html")) text = text.replace(/http:\/\//g, "//");

      res.writeHead("200", {
        "Content-Type": type,
        "Cache-Control": "public, max-age=" + 1000 * 60,
      });
      res.end(text);
    }
  } catch (e) {
    console.log("missing", e);
    res.writeHead("404");
    res.end("");
  }
};
