var allExplosions =  []; 
var explosionSpriteSheet = null;
function Explosion(x,y,   explosionSpriteSheet,type) { //type = "Big" || "Small"
    this.pos = {x:x+16,y:y+16}; //+16 pq eh desenhado no corner.. GAMBIARRA RIARIARIAIR
    this.owner = null;
    this.currentSprite = null;
    this.remove = false;
    this.spriteSheet = explosionSpriteSheet;
    this.animationContext = this.spriteSheet.createContext();
    
    
    this.update = function(){
        if (!explosionSpriteSheet.getAnimation("explosionBig",this.animationContext).isStopped()){
            this.currentSprite = explosionSpriteSheet.getSprite("explosion" + type,this.animationContext);
        }else{
            //this.currentSprite = null;
            this.remove = true;
        }
    }
    
    
}