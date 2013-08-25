function Player(){
    
    this.pos = {x:16*6, y:16*6};
    this.spawningPos = {x:16*6, y:16*6};
    this.posPrevious = {x:0,y:0};
    this.level = "";
    this.lives = 4;  // number of lives the player can die;
    this.health = 1; // enemy healt
    this.maxLives = 1; // when lives pass the max lives the tank die (done this way to use the value lives in the animation)
    this.gamePoints = 0;
    this.speed = 1.2;
    this.bulletSpeed = 5;
    this.type = "player";
    this.subtype = 1;
    this.subsubtype = ""; // this tank carries an item
    this.currentSpeed = {x:0,y:0};
    this.lastActiveSpeed = {x:0,y:0};
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
    this.currentDirection = this.direction.Up;
    this.spawningDirection = this.direction.Up;
    this.currentCollisionFunc = this.defaultCollision;
    this.fireCooldownTime = 0.25*1000; //in miliseconds
    this.spawnTime = 1.5*1000; // in ms
    this.spawning = false;
    this.isShielded = false;
    this.isFrozen = false;
    this.isDrifting = false;  //http://bestanimatedgifs.files.wordpress.com/2012/12/170.gif
    this.isDriftingTimeout = null;
    this.driftCooldownTime = 250; //in miliseconds
    this.ignore = [];
    this.isDead = false;
    this.spawnerInstance = null;
    this.itemSpanwerInstance = null;
    this.points = null;    
    this.firstUpdate = true;
    this.maxBullets = 1;
    this.canFire = true;
    this.bullets = [];
    this.doubleExplosionBullets = false;
    this.breakSteel = false;
    this.isColliding = false;

    //this.playTankEngine = false;
    //this.engineIdleSound = null;
    
    this.collisionInstance = null;
    
    //only for enemies
    this.probOfChangeDirection = 300;

    //this.playEngineSound = false;

    this.upgradeLevel = function(newLevel_opt){
        if (newLevel_opt==="")return;
        this.level++;
        if (newLevel_opt != null) this.level = newLevel_opt;
        
        if (this.level>4) this.level=4;
        this.doubleExplosionBullets = false;
        this.breakSteel = false;

        if (this.level==1){
            this.bulletSpeed = 5;
            this.speed = 1.2;
            this.maxBullets = 1;
        }
        if (this.level==2){
            this.bulletSpeed = 7.5;
            this.speed = 1.3;
            this.maxBullets = 1;
        }
        if (this.level==3){
            players[0].bulletSpeed = 7.5;
            this.maxBullets = 2;
            this.speed = 1.3;
        }
        if (this.level==4){
            this.bulletSpeed = 7.5;
            this.doubleExplosionBullets = true;
            this.breakSteel = true;
            this.maxBullets = 2;
            this.speed = 1.3;
        }
    }
    
    
    
    this.setItemSpawner = function(is){
        this.itemSpanwerInstance = is;
    }
    
    this.setInput = function(input){
        this.input = input;
    };
    
    this.spawnPlayer = function(){
        this.pos = {x: this.spawningPos.x, y: this.spawningPos.y};
        this.posPrevious = {x: this.spawningPos.x, y:this.spawningPos.y};
        this.currentDirection = this.spawningDirection;
        this.currentSpeed = {x:0,y:0};
        
        this.spawning = true;
        setTimeout((function(self) {            //Self-executing func which takes 'this' as self
                         return function() {    //Return a function in the context of 'self'
                             self.spawning = false;
                             if (self.type === "player") self.setShieldOn(1*6000);
                             if (self.subsubtype === "special") self.itemSpanwerInstance.clearItems();
                         };
                     })(this),
                     this.spawnTime );
    }
    
    this.setShieldOn = function(time){
        this.isShielded = true;
        //this.shieldSprite = this.spriteSheet.getSprite("shield");
        setTimeout((function(self) {         //Self-executing func which takes 'this' as self
                         return function() {   //Return a function in the context of 'self'
                             self.setShieldOff();// = false;
                         };
                     })(this),
                     time );
        
    }

    this.setShieldOff = function(){
         this.isShielded = false;
         this.shieldSprite = null;
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


        } else if (this.isFrozen){
            if (this.animationContext === null){
                this.animationContext = this.spriteSheet.createContext(); 
            }
            this.currentSprite = this.spriteSheet.getSprite(this.subsubtype+ this.type+(this.subtype+(this.health-1))+this.currentDirection+this.level,this.animationContext);
            this.spriteSheet.getAnimation(this.subsubtype+this.type+(this.subtype+(this.health-1))+this.currentDirection+this.level,this.animationContext).stop();
        } else {     
            if (this.isShielded){
                this.shieldSprite = this.spriteSheet.getSprite("shield");
            } 

            for (var i=this.ignore.length-1; i>=0; i--){
                var p = this.ignore[i];        
                var pos = {x:(this.pos.x+16), y:(this.pos.y+16)}; // get the center pos
                var pos2 = {x:(p.pos.x+16), y:(p.pos.y+16)};
                if (Math.pow(pos.x-pos2.x,2) + Math.pow(pos.y-pos2.y,2) > 38*38){ //for not using sqrt
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

                this.currentSpeed.x = this.input.value.x*this.speed;
                this.pos.x +=  this.currentSpeed.x;
                if (this.input.value.x > 0) this.currentDirection = this.direction.Right; else this.currentDirection = this.direction.Left;
                 //put him back on the grid:
                this.pos.y = Math.round((this.pos.y )/gridSize)*gridSize;
            }else if (this.input.value.y !== 0){

                this.currentSpeed.y = this.input.value.y*this.speed;
                this.pos.y +=  this.currentSpeed.y;
                if (this.input.value.y > 0) this.currentDirection = this.direction.Down; else this.currentDirection = this.direction.Up;
                //put him back on the grid:
                this.pos.x = Math.round((this.pos.x )/gridSize)*gridSize;
            }else {
                //no input
                if (this.isDrifting){
                    this.pos.x +=  this.lastActiveSpeed.x;
                    this.pos.y +=  this.lastActiveSpeed.y;
                }
            }
            
            
        
            if ( this.currentSpeed.x != 0 ||  this.currentSpeed.y != 0 ){
                    this.lastActiveSpeed.x = this.currentSpeed.x;
                    this.lastActiveSpeed.y = this.currentSpeed.y;
                
            }
            // instantiate bullet
            if (this.input.value.fire === true && this.bullets.length < this.maxBullets && this.canFire){
                if (this.type==="player"){
                    howlSounds.playerShot.play();
                }
                //console.log("Shooting");
                if (this.bulletSpriteSheet){
                    this.canFire = false;
                    var bulletSprite = this.bulletSpriteSheet.getSprite("bullet"+this.currentDirection);
                    var newbullet = new Bullet(this.pos.x +gridSize/2, this.pos.y +gridSize/2, bulletSprite);
                   
                    newbullet.currentDirection = this.currentDirection;
                    newbullet.breakSteel = this.breakSteel;
                    newbullet.bulletSpeed = this.bulletSpeed;
                    newbullet.calculateSpeed();
                    newbullet.owner = this;
                    this.bullets.push(newbullet);
                    this.collisionInstance.createDynamicCollider({obj:newbullet, type:newbullet.type ,w:16,h:16}, newbullet.defaultCollision);
                
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
                this.currentSprite = this.spriteSheet.getSprite(this.subsubtype+ this.type+(this.subtype+(this.health-1))+this.currentDirection+this.level,this.animationContext);
            }
            //console.log(this.type+this.subtype+this.currentDirection);
            
            //console.log(""+this.type+this.subtype+this.currentDirection+this.health);
            if (this.input.value.x === 0 && this.input.value.y === 0 ){
                this.spriteSheet.getAnimation(this.subsubtype+this.type+(this.subtype+(this.health-1))+this.currentDirection+this.level,this.animationContext).stop();
            } else {
                this.spriteSheet.getAnimation(this.subsubtype+this.type+(this.subtype+(this.health-1))+this.currentDirection+this.level,this.animationContext).continue();
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

    // froze player for a time
    this.freeze = function(){
        this.isFrozen = true;
    }

    this.removePlayer = function(){
        this.isDead = true;
        this.currentSprite = null;
        this.collisionInstance.removeDynamicCollider(this);
    }
    
    this.die = function(optLives){
        //this.health++;
        if (this.subsubtype === "special"){
            //spawn item
            this.itemSpanwerInstance.spawnItem();
            this.subsubtype = "";
        }
        
        if (this.type==="player" || (this.health+=optLives||1) > this.maxLives){
            this.isFrozen = false;
            allExplosions.push(new Explosion(this.pos.x,this.pos.y,explosionSpriteSheet, "Big", this.points));
            this.shieldSprite = null;
            //this.bullets = []; // erase all player bullets
            if (this.type==="player"){
                howlSounds.playerExplosion.play();
                this.lives--;
                this.upgradeLevel(1);
                if (this.lives >= 0){
                    this.spawnPlayer();
                }
            } else {
                howlSounds.enemyExplosion.play();
                this.removePlayer();
            }
        } else {            
            if (this.type != "player"){
                howlSounds.hitArmor.play();
            }
        }
    }
    
    this.removeAllBullets = function(){
        for (var i=this.bullets.length-1; i>=0; i--){
            this.collisionInstance.removeDynamicCollider( this.bullets[i] );
            this.bullets.splice(i,1);  
        }

    }
    
    this.removeBullets = function(){
        for (var i=this.bullets.length-1; i>=0; i--){
            if (this.bullets[i].remove){
                this.collisionInstance.removeDynamicCollider( this.bullets[i] );
                //create new collider for explosion
                var explinfo = this.bullets[i].createExplosionObject();

                this.collisionInstance.createDynamicCollider(explinfo, this.bullets[i].deafultExplosionCollision, this.bullets[i].explosionRect.offx, this.bullets[i].explosionRect.offy);
                setTimeout((function(self) { return function() { self.col.removeDynamicCollider(self.obj)};})({col:this.collisionInstance, obj:explinfo.obj}), 200); // <--- bah, to muito louco, wololo
                            
                if (this.doubleExplosionBullets){
                    var explinfo2 = this.bullets[i].createExplosionObject();
                    var bulletdir = this.bullets[i].intDirection;
                    this.collisionInstance.createDynamicCollider(explinfo2, this.bullets[i].deafultExplosionCollision, this.bullets[i].explosionRect.offx+bulletdir.x*8, this.bullets[i].explosionRect.offy+bulletdir.y*8);
                    setTimeout((function(self) { return function() { self.col.removeDynamicCollider(self.obj)};})({col:this.collisionInstance, obj:explinfo2.obj}), 200); // <--- bah, to muito louco, wololo
                }
                this.bullets.splice(i,1);  
            }
        }
    }
    
    this.isThisBulletFromThisPlayer = function(bullet){
        for (var i=this.bullets.length-1; i>=0; i--){
            if (this.bullets[i] === bullet){
                return true;
            }
        }
        return false;
    };
    
    
    this.startDrifting = function(){
        if (this.input.value.x != 0 || this.input.value.y != 0){
            this.isDrifting = true;
            if (this.isDriftingTimeout != null){ 
                clearTimeout(this.isDriftingTimeout);
            }
            
            
            this.isDriftingTimeout =  setTimeout((function(self) {       
                                         return function() {   
                                             self.stopDrifting();  
                                         };
                                     })(this),
                                     this.driftCooldownTime );
                                     
                                
            console.log("drifting");
        }
    };
    
    this.stopDrifting = function(){
         console.log("stop drifting");
         this.isDrifting = false;
    }
    
    // create a dynamic collider for the player, and a callback function that will execute when this collider hits something
    // the function has access to the object itself and the other object it collided.
    this.defaultCollision = function(info, other){      // function that is called when this obj collides with something
        var self = info.obj;
        var gridSize = 16;
        self.isColliding = false;
        if ((other.type==="tile" && !other.tile.playerPassThrough)  || other.type==="invisible" || other.type==="general"){
            info.obj.pos.y = Math.round((info.obj.pos.y )/gridSize)*gridSize;
            info.obj.pos.x = Math.round((info.obj.pos.x )/gridSize)*gridSize;  
            self.isColliding = true;
        }
        
        if (other.type==="tile" &&  other.tile.isSlippery ){
            info.obj.startDrifting();
        }
        if (other.type==="player" || other.type==="enemy" ){
            // this dumb player walk inside the spawn of another player
            if (self.spawning) {
                if (!contains(self.ignore, other.obj)) self.ignore.push(other.obj);
                if (!contains(other.obj.ignore, self)) other.obj.ignore.push(self);
                return;
            }
            self.isColliding = true;

            if (info.obj.input.value.x === 0 && info.obj.input.value.y===0) return; //boa

            var tile = {x:0,y:0};
            tile.x = Math.floor(other.obj.pos.x+gridSize) - Math.floor(info.obj.pos.x+gridSize);
            tile.y = Math.floor(other.obj.pos.y+gridSize) - Math.floor(info.obj.pos.y+gridSize);
            
            
            
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
        
        
        if (self.spawning === false && other.type === "bullet" && !self.isShielded && !other.obj.hit ){            
            if (other.obj.owner.type !== self.type){    // if they are of different class, they can kill each other (player hit enemy, or enemy hit player)    
                other.obj.hit = true;             
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