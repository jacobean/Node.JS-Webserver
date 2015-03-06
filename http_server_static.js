var fs = require('fs');
var http = require('http');
var url = require('url');
var path = require('path');
var ROOT_DIR = "html/";
http.createServer(function (req, res) {
  var urlObj = url.parse(req.url, true, false);
  var filename = ROOT_DIR + urlObj.pathname;

  if(urlObj.pathname.indexOf("getcity") !=-1) {
    var myRe = new RegExp("^"+urlObj.query["q"]);

    fs.readFile('cities.dat.txt', function (err, data) {
      if(err) throw err;
      cities = data.toString().split("\n");
      var jsonresult = [];

      for(var i = 0; i < cities.length; i++) {
        var result = cities[i].search(myRe); 
        if(result != -1)
          jsonresult.push({city:cities[i]});
      }   

      res.writeHead(200);
      res.end(JSON.stringify(jsonresult));
    });
    return;
  }

  var contentTypesByExtension = {
    '.html': "text/html",
    '.css':  "text/css",
    '.js':   "text/javascript"
  };

  fs.exists(filename, function(exists) {
    if(!exists) {
      res.writeHead(404, {"Content-Type": "text/plain"});
      res.write("404 Not Found\n");
      res.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, function (err,data) {
      if(err) {        
        res.writeHead(500, {"Content-Type": "text/plain"});
        res.write(err + "\n");
        res.end();
        return;
      }

      var headers = {};
      var contentType = contentTypesByExtension[path.extname(filename)];
      if (contentType) headers["Content-Type"] = contentType;
      res.writeHead(200, headers);
      res.write(data, "binary");
      res.end();
    });
  });
}).listen(80);
