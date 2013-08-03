
function GameMenu(){
    this.initPos = {x:37*16, y:3*16};
    this.spriteSheet = null;
    this.numOfEnemies = 0;
    
    this.setNumberOfEnemies = function(num){
        this.numOfEnemies = num;
    }
    
    this.setSpriteSheet = function(ss){
        this.spriteSheet = ss;
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
    }
}