
var express = require('express');
var app = express.createServer(express.logger());
app.use(express.static(__dirname));

var fs = require('fs');

app.get('/', function(request, response){
  response.send(fs.readFileSync('tanque/game.html').toString());
});

app.post('/send', function(request, response) {
    request.on('data', function(chunk) {
        fs.appendFile('tanque/highscores.txt', chunk.toString().replace(/<(?:.|\n)*?>/gm, '') + '\n');
    });
    response.send("ok");
});

app.listen(process.env.PORT , function() {
    console.log("listening on "+process.env.PORT);
});


/*
var http = require("http");

// create a server
http.createServer(function(req, res) {
    // on every request, we'll output 'Hello world'
    res.end("Hello world Bitches, Node is running!");
}).listen(process.env.PORT, process.env.IP);
*/