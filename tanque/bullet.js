function Bullet(x,y, sprite) {
    this.pos = {x:x,y:y};
    this.type = "bullet";
    this.owner = null;
    //this.spriteSheet = null;
    this.currentSprite = sprite;
    this.direction = {Up:"Up",Right:"Right",Down:"Down",Left:"Left"};    
    this.currentDirection = null;
    this.intDirection = {x:0,y:0};
    this.currentSpeed = {x:0,y:0}
    this.bulletSpeed = 9;
    this.bulletSize = 16;
    this.explosionRect = null;
    this.explosionColliderInfo = {x:0,y:0, w:0, h:0};
    this.remove = false;
    this.castExplosion = true;
    this.exploded = false;
    this.hit = false;
    this.breakSteel = false;
    //howlSounds.playerShot.play();
    
    this.update = function(){
        this.pos.x += this.currentSpeed.x;
        this.pos.y += this.currentSpeed.y;
    }
    this.calculateSpeed = function(){
        with (this.direction){ //with lixo
            if (this.currentDirection == Up){
                this.currentSpeed.y -= this.bulletSpeed;
                this.intDirection.y = -1;
            }
            if (this.currentDirection == Down){
                this.currentSpeed.y += this.bulletSpeed;
                this.intDirection.y = 1;
            }
            if (this.currentDirection == Left){
                this.currentSpeed.x -= this.bulletSpeed;
                this.intDirection.x = -1;
            }
            if (this.currentDirection == Right){
                this.currentSpeed.x += this.bulletSpeed;
                this.intDirection.x = 1;
            }
            
        }
    }

    
    this.defaultCollision = function(info, other){
        var self = info.obj;
        if (other.type === "tile" && !self.remove){
            if (!other.tile.bulletPassThrough){
                if (self.owner.type==="player"){
                    if (other.tile.isBreakable) {
                        howlSounds.hitBrick.play();
                    } else {
                        howlSounds.hitWall.play();
                    }
                }
                var gridSize = other.obj.tileSize;
                self.remove = true;   
                this.castExplosion = true; 
                self.explosionColliderInfo = {x:(other.x*gridSize), y:(other.y*gridSize), w:other.tile.size.x, h:other.tile.size.y};
            }
           
        }
        else if (other.type === "bullet" && (other.obj.owner.type !== self.owner.type)){
            self.remove = true;
            this.castExplosion = false;
        }
        else if (other.type === "player" || (other.type === "enemy" && self.owner.type !== "enemy")) {
            if (self.owner !== other.obj && !other.obj.spawning){
                self.remove = true;
                self.setBulletExplosion(self.pos.x-8, self.pos.y-8);
                self.owner.gamePoints += (other.obj.points || 0);
            }
            //console.log("teste");
        }
        else if (other.type === "general"){
            self.remove = true;
        }
        //else if (other.type === "general" || other.type === "player" || other.type === "enemy"){
        //    self.remove = true;
        //    this.castExplosion = false;
        //}
        //
        if (self.remove && this.castExplosion && !this.exploded){
            self.setBulletExplosion(self.pos.x-8, self.pos.y-8);
           
            //console.log("criou");
        }
    }

    this.setBulletExplosion = function(x,y){
        this.exploded = true;
        allExplosions.push(new Explosion(x,y,explosionSpriteSheet, "Small"));
    }
    
    this.createExplosionObject = function(){
        var r;
        // ver se não dá pra fazer isso de um jeito menos burro
        with(this.direction){
            switch(this.currentDirection){
                case Up:    this.explosionColliderInfo.x=this.pos.x+this.bulletSize/2; r={offx:-this.bulletSize, offy:this.explosionColliderInfo.h-this.bulletSize/2, w:32, h:8}; break;
                case Down:  this.explosionColliderInfo.x=this.pos.x+this.bulletSize/2; r={offx:-this.bulletSize, offy:0,  w:32, h:8}; break;
                case Left:  this.explosionColliderInfo.y=this.pos.y+this.bulletSize/2; r={offx:this.explosionColliderInfo.w-this.bulletSize/2, offy:-this.bulletSize,  w:8,  h:32}; break;
                case Right: this.explosionColliderInfo.y=this.pos.y+this.bulletSize/2; r={offx:0, offy:-this.bulletSize,  w:8,  h:32}; break;
            }
        }
        
        this.explosionRect = r;
        return {obj:{pos:this.explosionColliderInfo, breakSteel:this.breakSteel, exploded:false, owner:this.owner, currentSpeed:{x:0,y:0}}, type:"explosion" ,w:r.w, h:r.h};
    }
    
    this.deafultExplosionCollision = function(info, other){
        
    }
}