var allExplosions =  []; 
var explosionSpriteSheet = null;
function Explosion(x,y, explosionSpriteSheet,type, optValue) { //type = "Big" || "Small"
    this.pos = {x:x+16,y:y+16}; //+16 pq eh desenhado no corner.. GAMBIARRA RIARIARIAIR
    this.owner = null;
    this.currentSprite = null;
    this.remove = false;
    this.spriteSheet = explosionSpriteSheet;
    this.animationContext = this.spriteSheet.createContext();
    this.points = optValue || "";
    
    
    this.update = function(){
        if (!explosionSpriteSheet.getAnimation("explosionBig",this.animationContext).isStopped()){
            //console.log("explosion" + type + this.points);
            this.currentSprite = explosionSpriteSheet.getSprite("explosion" + type + this.points, this.animationContext);
        }else{
            //this.currentSprite = null;
            this.remove = true;
        }
    }
    
    
}