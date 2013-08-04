function Player(){
    
    this.pos = {x:16*6, y:16*6};
    this.spawningPos = {x:16*6, y:16*6};
    this.posPrevious = {x:0,y:0};
    this.lives = 1;
    this.maxLives = 1; // when lives pass the max lives the tank die (done this way to use the value lives in the animation)
    this.speed = 2;
    this.bulletSpeed = 7;
    this.type = "player";
    this.subtype = 1;
    this.currentSpeed = {x:0,y:0};
    this.input = {};
    this.spriteSheet = null;
    this.bulletSpriteSheet = null;
    this.explosionSpritesheet = null; //eitcha lele
    this.bigExplosionSpritesheet = null;  
    this.spawnSpriteSheet = null;
    this.currentSprite = null;
    this.shieldSprite = null;
    this.direction = {Up:"Up",Right:"Right",Down:"Down",Left:"Left"};//fazendo dessa forma pq com o enum n tem garantia q vai ser string, e o nome dos sprites pode mudar no futuro
    this.animationContext = null;
    //this.shieldAnimContext = null;
    this.currentDirection = this.direction.Up;
    this.currentCollisionFunc = this.defaultCollision;
    this.fireCooldownTime = 0.5*1000; //in miliseconds
    this.spawnTime = 1.5*1000; // in ms
    this.spawning = false;
    this.isShielded = false;
    this.ignore = [];
    this.isDead = false;
    this.spawnerInstance = null;
    //this.bornTogether = false;
    //this.shieldTime = 1*1000; // in ms
    
    this.firstUpdate = true;
    this.maxBullets = 1;
    this.canFire = true;
    this.bullets = [];
    
    this.collisionInstance = null;
    
    
    
    this.setInput = function(input){
        this.input = input;
    };
    
    this.spawnPlayer = function(){
        this.pos = {x: this.spawningPos.x, y: this.spawningPos.y};
        this.posPrevious = {x: this.spawningPos.x, y:this.spawningPos.y};
        this.currentSpeed = {x:0,y:0};
        
        this.spawning = true;
        setTimeout((function(self) {            //Self-executing func which takes 'this' as self
                         return function() {    //Return a function in the context of 'self'
                             self.spawning = false;
                             if (self.type === "player") self.setShieldOn(1*3000);
                         };
                     })(this),
                     this.spawnTime );
    }
    
    this.setShieldOn = function(time){
        this.isShielded = true;
        setTimeout((function(self) {         //Self-executing func which takes 'this' as self
                         return function() {   //Return a function in the context of 'self'
                             self.isShielded = false;
                         };
                     })(this),
                     time );
        
    }
    
    //called each draw frame
    this.update = function(){
        
        if (this.firstUpdate){
            this.spawnPlayer();
            this.firstUpdate = false;
            //return false;
        }
        
        if (this.spawning) {
            this.currentSprite = this.spawnSpriteSheet.getSprite("spawn");            
        } else if (this.isDead){
            
        } else {     
            if (this.isShielded){
                this.shieldSprite = this.spriteSheet.getSprite("shield");
            } else {
                this.shieldSprite = null;
            }

            for (var i=this.ignore.length-1; i>=0; i--){
                var p = this.ignore[i];        
                var pos = {x:(this.pos.x+16), y:(this.pos.y+16)}; // get the center pos
                var pos2 = {x:(p.pos.x+16), y:(p.pos.y+16)};
                if (Math.pow(pos.x-pos2.x,2) + Math.pow(pos.y-pos2.y,2) > 35*35){ //for not using sqrt
                    this.ignore.splice(i,1);
                }
            }
        
            var gridSize =16;
            this.currentSpeed.x = 0;
            this.currentSpeed.y = 0;
            
            this.posPrevious.x = this.pos.x;
            this.posPrevious.y = this.pos.y;
                
            //eu nao consegui gravar porque isso aqui funcionou:
            if (this.input.value.x !== 0 ){
                //this.pos.x += this.input.value.x*this.speed; 
                this.currentSpeed.x = this.input.value.x*this.speed;
                this.pos.x +=  this.currentSpeed.x;
                if (this.input.value.x > 0) this.currentDirection = this.direction.Right; else this.currentDirection = this.direction.Left;
                 //put him back on the grid:
                this.pos.y = Math.round((this.pos.y )/gridSize)*gridSize;
            }else if (this.input.value.y !== 0){
                //this.pos.y += this.input.value.y*this.speed;
                this.currentSpeed.y = this.input.value.y*this.speed;
                this.pos.y +=  this.currentSpeed.y;
                if (this.input.value.y > 0) this.currentDirection = this.direction.Down; else this.currentDirection = this.direction.Up;
                //put him back on the grid:
                this.pos.x = Math.round((this.pos.x )/gridSize)*gridSize;
            } 
            
            // instantiate bullet
            if (this.input.value.fire === true && this.bullets.length < this.maxBullets && this.canFire){
                //console.log("Shooting");
                if (this.bulletSpriteSheet){
                    this.canFire = false;
                    var bulletSprite = this.bulletSpriteSheet.getSprite("bullet"+this.currentDirection);
                    var newbullet = new Bullet(this.pos.x +gridSize/2, this.pos.y +gridSize/2, bulletSprite);
                   
                    newbullet.currentDirection = this.currentDirection;
                    newbullet.bulletSpeed = this.bulletSpeed;
                    newbullet.calculateSpeed();
                    newbullet.owner = this;
                    this.bullets.push(newbullet);
                    this.collisionInstance.createDynamicCollider({obj:newbullet, type:newbullet.type ,w:16,h:16}, newbullet.defaultCollision);
                    //relaoding:
                
                    setTimeout((function(self) {         //Self-executing func which takes 'this' as self
                                     return function() {   //Return a function in the context of 'self'
                                         self.fireCoolDown(); //Thing you wanted to run as non-window 'this'
                                     };
                                 })(this),
                                 this.fireCooldownTime );
                    
                }
            }
            
            if (this.spriteSheet){ 
                if (this.animationContext === null){
                    this.animationContext = this.spriteSheet.createContext(); 
                }
                //console.log(this.spriteSheet.getSprite("player"+this.currentDirection,this.animationContext));
                this.currentSprite = this.spriteSheet.getSprite(this.type+(this.subtype+(this.lives-1))+this.currentDirection,this.animationContext);
            }
            //console.log(this.type+this.subtype+this.currentDirection);
            
            //console.log(""+this.type+this.subtype+this.currentDirection+this.lives);
            if (this.input.value.x === 0 && this.input.value.y === 0 ){
                this.spriteSheet.getAnimation(this.type+(this.subtype+(this.lives-1))+this.currentDirection,this.animationContext).stop();
            } else {
                this.spriteSheet.getAnimation(this.type+(this.subtype+(this.lives-1))+this.currentDirection,this.animationContext).continue();
            }    
        } 
        //if (this.isDead){
        //    this.currentSprite = null;
        //}
        //remove bullets
        this.removeBullets();
        
        //update bullets
        for (var b in this.bullets)               
            this.bullets[b].update();
            
        
        if (this.isDead && this.bullets.length===0){
            this.spawnerInstance.removeDeadEnemy(this);
        }
    };
    
    this.fireCoolDown=function(){
        this.canFire = true;
        
    }
    
    this.die = function(){
        //this.lives++;
        if (this.type==="player" || (++this.lives) > this.maxLives){
            allExplosions.push(new Explosion(this.pos.x,this.pos.y,explosionSpriteSheet, "Big"));
            this.shieldSprite = null;
            //this.bullets = []; // erase all player bullets
            if (this.type==="player"){
                this.spawnPlayer();
            } else {
                this.isDead = true;
                this.currentSprite = null;
                this.collisionInstance.removeDynamicCollider(this);
                //this.spawnerInstance.removeDeadEnemy(this);
            }
        }
    }
    
    this.removeBullets = function(){
        for (var i=this.bullets.length-1; i>=0; i--){
            if (this.bullets[i].remove){
                this.collisionInstance.removeDynamicCollider( this.bullets[i] );
                //create new collider for explosion
                var explinfo = this.bullets[i].createExplosionObject()
                this.collisionInstance.createDynamicCollider(explinfo, this.bullets[i].deafultExplosionCollision, this.bullets[i].explosionRect.offx, this.bullets[i].explosionRect.offy);
                setTimeout((function(self) { return function() { self.col.removeDynamicCollider(self.obj)};})({col:this.collisionInstance, obj:explinfo.obj}), 1000); // <--- bah, to muito louco, wololo
                this.bullets.splice(i,1);              
            }
        }
    }
    
    this.isThisBulletFromThisPlayer = function(bullet){
        for (var i=this.bullets.length-1; i>=0; i--){
            if (this.bullets[i] == bullet){
                return true;
            }
        }
        return false;
    };
    
    
    // create a dynamic collider for the player, and a callback function that will execute when this collider hits something
    // the function has access to the object itself and the other object it collided.
    this.defaultCollision = function(info, other){      // function that is called when this obj collides with something
        var self = info.obj;
        var gridSize = 16;
        if (other.type==="tile"  || other.type==="invisible"){
            info.obj.pos.y = Math.round((info.obj.pos.y )/gridSize)*gridSize;
            info.obj.pos.x = Math.round((info.obj.pos.x )/gridSize)*gridSize;  
        }
        if (other.type==="player" || other.type==="enemy" ){
            if (info.obj.input.value.x === 0 && info.obj.input.value.y===0) return; //boa

            var tile = {x:0,y:0};
            tile.x = Math.floor(other.obj.pos.x+gridSize) - Math.floor(info.obj.pos.x+gridSize);
            tile.y = Math.floor(other.obj.pos.y+gridSize) - Math.floor(info.obj.pos.y+gridSize);
            
            // this dumb player walk inside the spawn of another player
            if (self.spawning) {
                if (!contains(self.ignore, other.obj)) self.ignore.push(other.obj);
                if (!contains(other.obj.ignore, self)) other.obj.ignore.push(self);
                return;
            }
            
            if (contains(self.ignore, other.obj)) {
                return;
            }
            
            
            // if any of this is true, the obj should not be blocked
            if (tile.x <= -26 && (info.obj.currentSpeed.y !== 0 || info.obj.currentSpeed.x > 0)) return;
            if (tile.x >=  26 && (info.obj.currentSpeed.y !== 0 || info.obj.currentSpeed.x < 0)) return;
            if (tile.y <= -26 && (info.obj.currentSpeed.x !== 0 || info.obj.currentSpeed.y > 0)) return;
            if (tile.y >=  26 && (info.obj.currentSpeed.x !== 0 || info.obj.currentSpeed.y < 0)) return;            
            
            info.obj.pos.x = info.obj.posPrevious.x;
            info.obj.pos.y = info.obj.posPrevious.y;

            // align tank on the grid
            if (info.obj.currentSpeed.x !== 0)
                info.obj.pos.y = Math.round((info.obj.pos.y )/gridSize)*gridSize;            
            else if (info.obj.currentSpeed.y !== 0)
                info.obj.pos.x = Math.round((info.obj.pos.x )/gridSize)*gridSize;
        }
        
        
        if (self.spawning === false && other.type === "bullet" && !other.obj.remove){
            
            if (other.obj.owner.type !== self.type){    // if they are of different class, they can kill each other (player hit enemy, or enemy hit player)
                other.obj.remove = true;
                self.die();
            } else {
      
            }             
        }
                 
    };

    this.setCollisionInstance = function(col){
        this.collisionInstance = col;
        this.createCollider();
    }
    
    this.createCollider = function(){  
        this.collisionInstance.createDynamicCollider({obj:this, type:this.type ,w:32,h:32}, this.defaultCollision); 
    };

            
        
    
} 