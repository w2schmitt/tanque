
function Spawner(){
    this.totalEnemies = 0;
    this.maxEnemies = 4;
    this.queue = [];
    this.enemies = [];
    this.spawnPos = [{x:4*16,y:2*16},{x:16*16,y:2*16},{x:28*16,y:2*16}];
    this.spawnCounter = 0;
    this.intervalId = 0;
    this.collisionInstance = null;
    this.itemSpawnerInstance = null;
    this.bulletSpriteSheet = null;
    this.explosionSpriteSheet = null;
    this.playerSpriteSheet = null;
    this.spawnSpriteSheet = null;
    this.IAinput = null;
    this.freezingEnemies = false;
    
    
    this.setIAInput = function(ia){
        this.IAinput = ia;
    };

    this.setItemSpawner = function(is){
        this.itemSpawnerInstance = is;
    }
    
    this.addEnemy = function(type){
        this.queue.push(type);
    }
    
    this.addEnemyList = function(list){
        this.totalEnemies = list.length;
        this.queue = list;
        clearInterval(this.intervalId);
        this.intervalId = setInterval((function(self) {            //Self-executing func which takes 'this' as self
                         return function() {    //Return a function in the context of 'self'
                            if (self.enemies.length < self.maxEnemies && self.queue.length>0){
                                self.spawnEnemy();
                                //console.log("spawnou ",self.queue.length);
                            }
                         };
                     })(this),
                     3000 );

    };
    
    this.setSpriteSheets = function(player, bullets, explosion, spawn){
        this.bulletSpriteSheet = bullets;
        this.explosionSpriteSheet = explosion;
        this.playerSpriteSheet = player;
        this.spawnSpriteSheet = spawn;
    }
    
    this.allEnemiesDead = function(){
        var enemiesDead =  (this.queue.length===0 && this.enemies.length===0);
        //if (enemiesDead){
        //     clearInterval(this.intervalId);
        //}
        
        return enemiesDead;
    }
    
    this.setCollision = function(col){
        this.collisionInstance = col;
    }
    
    this.spawnEnemy = function(){
        var e = this.getEnemyFromQueue();
        var subsubtype = "";
        var p = null;
        if (e>4) {  // this tank will carry an item    
            subsubtype = "special";
            e-=4;
        }

        if (e===1){
            p = this.createBasicEnemy();            
        } else if (e===2){
            p = this.createBasicEnemy(); 
            p.speed = 2.7;            
        } else if (e===3){
            p = this.createBasicEnemy();  
            p.bulletSpeed = 7.5;              
        } else if (e===4){
            p = this.createBasicEnemy(); 
            p.maxLives = 4;            
        }
        
        if (p!==null){            
            p.subtype = e;
            p.points = e*100;
            p.subsubtype = subsubtype;
            this.totalEnemies--; 

            if (this.freezingEnemies){
                p.isFrozen = true;
            }   
        }
    }

    this.freezeEnemies = function(time){
        this.freezingEnemies = true;
        for (var i in this.enemies){
            this.enemies[i].isFrozen = true;
        }

        setTimeout((function(self) {         //Self-executing func which takes 'this' as self
                         return function() {   //Return a function in the context of 'self'
                            for (var i in self.enemies){
                                self.enemies[i].isFrozen = false;
                            }
                            self.freezingEnemies = false;
                         };
                     })(this),
                     time );
    } 
    
    this.createBasicEnemy = function(){
        var p = new Player();
        p.spawningPos = this.spawnPos[this.spawnCounter++%this.spawnPos.length];
        p.type = "enemy";
        p.speed = 0.85;
        p.bulletSpeed = 5;
        p.maxBullets = 1;
        p.setItemSpawner(this.itemSpawnerInstance);
        p.spriteSheet = this.playerSpriteSheet; 
        p.bulletSpriteSheet = this.bulletSpriteSheet;
        p.explosionSpritesheet = this.explosionSpriteSheet;
        p.spawnSpriteSheet = this.spawnSpriteSheet;
        p.setCollisionInstance(this.collisionInstance);
        p.setInput(this.IAinput.clone()); 

       
        p.spawnerInstance = this;
        this.enemies.push(p);
        
        return p;
    }
    
    this.getEnemyFromQueue = function(){
        return this.queue.splice(0,1)[0];
    }
    
    this.removeDeadEnemy = function(p){
        this.enemies.splice(this.enemies.indexOf(p),1);
    }
    
}