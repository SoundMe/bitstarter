var express = require('express');

var app = express.createServer(express.logger());
var fs=require('fs');
var buf = new Buffer(fs.readFileSync('index.html'));
var myHello = buf.toString();

app.get('/', function(request, response) {
  response.send(myHello);
});

app.configure(function(){
    app.use('/public',express.static(__dirname + '/public'));
    });

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
