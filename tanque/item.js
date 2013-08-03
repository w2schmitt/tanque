//var allExplosions =  []; 
//var explosionSpriteSheet = null;
function Item(x,y,   itemSpriteSheet,subtype) {
    this.pos = {x:x,y:y};
    this.owner = null;
    this.currentSprite = null;
    this.remove = false;
    this.spriteSheet = itemSpriteSheet;
    this.animationContext = this.spriteSheet.createContext();
    this.subtype = subtype
    this.type = "item";
    
    this.createCollision = function(){
        
    }
    
    this.update = function(){
        //if (!this.spriteSheet.getAnimation("item" + this.type,this.animationContext).isStopped()){
            this.currentSprite = this.spriteSheet.getSprite(this.type + this.subtype, this.animationContext);
       // }else{
            //this.currentSprite = null;
        //    this.remove = true;
        //}
    }
    
    
}