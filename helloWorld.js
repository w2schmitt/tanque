
var express = require('express');
var mongoose = require('mongoose');
var db = null;
var Score = null;

try{
    //start mongo with $./mongod
    //throw new Error(); //skip mongo connection
    db = mongoose.connect('mongodb://' + process.env.IP + '/my_database', function(err) {
        if (err){
            db = null;
            Score = null;
            console.log("error on mongoDB, falling back to text store")
        }
    });
    //define model schema
    mongoose.model('Score', {
        name: { type: String },
        score: Number
    });
    //Set model definition
    Score = db.model("Score");
    console.log("Connect to MongoDB sucessfully");
    
}catch(err){
    console.log("Error on MongoDB");
}

var app = express.createServer(express.logger());
app.use(express.static(__dirname + "/tanque"));

var fs = require('fs');

app.get('/', function(request, response){
  response.send(fs.readFileSync('tanque/game.html').toString());
});

app.get('/highscores', function(request, response){
    if (db == null){
        //text fallback:
        response.send(fs.readFileSync('tanque/highscores.txt').toString());
    }else{
        //mongo:
        Score.find().sort({score:-1}).limit(10).exec(
            function(request, response){ 
                return function(err, scores) {
                    if (err) return response.send("0,error");
                    console.log(scores);
                        var ret = "";
                        for(var i in scores){
                            score = scores[i];
                            ret += score.score + "," + score.name + "\n";
                        }
                        response.send(ret);
                }
            }(request, response)
        );
    
     
    }
});

app.get('/getTop', function(request, response){
    //getTop(response.send);
    Score.find().sort({score:-1}).limit(10).exec(
        function(request, response){ 
            return function(err, scores) {
                if (err) return response.send("0,error");
                console.log(scores);
                response.send(scores);
            }
        }(request, response)
    );
});


app.post('/send', function(request, response) {
    request.on('data', function(chunk) {
        
        var data = chunk.toString().replace(/<(?:.|\n)*?>/gm, '');
        fs.appendFile('tanque/highscores.txt',  data+ '\n');
        
         //Save on mongo:
        if (db!=null){
            data = data.split(",");
            //instantiate new score
            var newScore = new Score();
            
            //set shit:
            newScore.name = data[1];
            newScore.score = data[0];
            
            //save
            newScore.save();
        }
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