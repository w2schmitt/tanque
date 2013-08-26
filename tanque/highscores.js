

function Highscores(){
    this.refreshRate =  1*60*1000;
    this.bindedObj = null;
    this.highscores = [];
    this.bind = function(id){
        this.bindedObj =  $("#" + id);
    }
    
    this.scoreComparator = function(a,b){
        return  (b.score) - (a.score) ; //DESC
        
    }
    
    
    this.parseHighscore = function(data){
        var highscores = data.split("\n");
        
        var highscoresObject = [];
        
        for (var i in highscores){
            var score = highscores[i];
            if (score != ""){
                highscoresObject.push({line:score , score:parseInt(score.split(",")[0]) , name:score.split(",")[1]   });
            }
        }
        var size = highscoresObject.length>10? 10 : highscoresObject.length;
        highscoresObject.sort(this.scoreComparator); 
        this.highscores = highscoresObject;
        
        if (this.bindedObj != null){ 
            this.bindedObj.html("");
            var highScoreTable = $("<table>");  
            var tr = $("<tr>").addClass("scoreHeader"); 
            tr.append($("<td>").addClass("scoreName").text("Player"));
            tr.append($("<td>").addClass("scoreNumber").text("Score"));
            highScoreTable.append(tr); 
            for (var i = 0; i < size ; i ++){
                //$("#top10").append( $("<p>").text( highscoresObject[i].score  + ": " + highscoresObject[i].name ));
                
                var tr = $("<tr>");
                
                tr.append($("<td>").addClass("scoreName").text(highscoresObject[i].name));
                tr.append($("<td>").addClass("scoreNumber").text(highscoresObject[i].score));
                highScoreTable.append(tr);
                
            } 
         this.bindedObj.append(highScoreTable);
         
        }
    };
    
     this.refreshHighScore = function(setRefreshTimeout){
         if (setRefreshTimeout==null) setRefreshTimeout = true;
         $.ajax({
            url : "/highscores.txt",
            cache: false,
            type: 'GET',
            success : (function(self) {         //Self-executing func which takes 'this' as self
                                     return function(data) {   //Return a function in the context of 'self'
                                         self.parseHighscore(data); //Thing you wanted to run as non-window 'this'
                                     };
                                })(this) 
        });
        
        if (setRefreshTimeout)
            setTimeout( (function(self) {         //Self-executing func which takes 'this' as self
                                     return function() {   //Return a function in the context of 'self'
                                         self.refreshHighScore(); //Thing you wanted to run as non-window 'this'
                                     };
                                })(this) 
                                , this.refreshRate); 
    }
    
    
    
    
    this.refreshHighScore();
    
    this.getAsText = function(number){
        var ret = "";
        if (number == null) number = 10;
        number = (this.highscores.length < 10)? this.highscores.length : number;
        for (var i = 0; i < number; i++){
            var score = this.highscores[i];
            
            ret += ((score.name != null)?score.name:"    ") + ": " + score.score + "\n";
        }
        return ret; 
    }
     
}
