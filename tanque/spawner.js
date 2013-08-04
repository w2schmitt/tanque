
function Spawner(){
    this.totalEnemies = 0;
    this.maxEnemies = 4;
    this.queue = [];
    this.enemies = [];
    this.spawnPos = [{x:2*16,y:1*16},{x:18*16,y:1*16},{x:34*16,y:1*16}];
    this.spawnCounter = 0;
    this.intervalId = 0;
    this.collisionInstance = null;
    this.bulletSpriteSheet = null;
    this.explosionSpriteSheet = null;
    this.playerSpriteSheet = null;
    this.spawnSpriteSheet = null;
    this.IAinput = null;
    
    
    this.setIAInput = function(ia){
        this.IAinput = ia;
    };
    
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
        var p = null;
        if (e==="1"){
            p = this.createBasicEnemy(); 
            
        } else if (e==="2"){
            p = this.createBasicEnemy(); 
            p.speed = 5;            
        } else if (e==="3"){
            p = this.createBasicEnemy();  
            p.bulletSpeed = 11;
           //p.  
            
        } else if (e==="4"){
            p = this.createBasicEnemy(); 
            p.maxLives = 4;            
        }
        
        if (p!==null){
            p.subtype = parseInt(e);
            this.totalEnemies--;    
        }
    }
    
    this.createBasicEnemy = function(){
        var p = new Player();
        p.spawningPos = this.spawnPos[this.spawnCounter++%this.spawnPos.length];
        p.type = "enemy";
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