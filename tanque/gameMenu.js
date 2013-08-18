
function GameMenu(){
    this.initPos = {x:33*16, y:3*16};
    this.stageFlagPos = {x:33*16, y:24*16};
    this.player1Pos = {x:33*16, y:16*16};
    this.spriteSheet = null;
    this.numOfEnemies = 0;
    this.numOflives = 0;
    this.currentMap = 0;
    this.playerPoints = [];
    
    this.setNumberOfEnemies = function(num){
        this.numOfEnemies = num;
    }
    
    this.setSpriteSheet = function(ss){
        this.spriteSheet = ss;
    }

    this.setPlayerPoints = function(player_i, points){
        this.playerPoints[player_i] = points;
    }
    
    this.drawMenu = function(context){
        var row=0;
        var col=0;
        //draw two columns of icons
        for (var i=0; i<this.numOfEnemies; i++){
            if (i%2===0){
                col = 0; 
                context.image(this.spriteSheet.getSprite("enemyIcon"), this.initPos.x+col*16, this.initPos.y+row*16, 16, 16);
            } else {                
                col =  1;
                context.image(this.spriteSheet.getSprite("enemyIcon"), this.initPos.x+col*16, this.initPos.y+row*16, 16, 16);
                row += 1;
            }
        }
        context.textFont(context.loadFont("pixelated.ttf"));
        context.fill(0, 0, 0);
        
        context.textSize(20);
        
        // player1 icon
        context.image(this.spriteSheet.getSprite("playerIcon"),  this.player1Pos.x,  this.player1Pos.y, 16,16);
        context.text("P-1", 33.07*16, 15.7*16);
        context.text(this.numOflives, 34.25*16, 17*16);

        // player points
        context.textSize(20);
        for (var i in this.playerPoints){      
            context.fill(200,200,0)      
            context.text("Score: "+this.playerPoints[i], 4*16, 1.5*16);
        }
        
        context.fill(0, 0, 0);
        // flag icon
        context.image(this.spriteSheet.getSprite("flagIcon"),  this.stageFlagPos.x,  this.stageFlagPos.y, 32,32);
       
        context.textSize(26);
        
        context.text(this.currentMap+1+"", 34*16, 27*16);
    }
}