
function Spawner(){
    this.totalEnemies = 0;
    this.maxEnemies = 4;
    this.queue = [];
    this.enemies = [];
    this.spawnPos = [{x:2*16,y:1*16},{x:18*16,y:1*16},{x:34*16,y:1*16}];
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
        this.intervalId = setInterval((function(self) {            //Self-executing func which takes 'this' as self
                         return function() {    //Return a function in the context of 'self'
                            if (self.enemies.length < self.maxEnemies)
                                self.spawnEnemy();
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
            p.speed = 5;            
        } else if (e===3){
            p = this.createBasicEnemy();  
            p.bulletSpeed = 12;              
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