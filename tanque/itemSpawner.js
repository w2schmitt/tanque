function itemSpawner(){
    this.itemSpritesheet = null;
    this.spawnArea = {x0:3*32,y0:2*32,x1:13*32,y1:13*32};
    this.allItems = [];
    this.collisionInstance;
    this.enemySpawner = null;
    this.map = null;
    this.itemPoints = 500;
    
    this.setSpriteSheets = function(ss){
        this.itemSpritesheet = ss;
    }

    this.setEnemySpawnerInstance = function(es){
        this.enemySpawner = es;
    }

    this.setMapInstance = function(m){
        this.map = m;
    }
    
    this.setCollision = function(col){
        this.collisionInstance = col;
    }
    
    this.spawnItem = function(){
        howlSounds.spawnItem.play();
        //(new buzz.sound("sounds/bonus_appear.wav")).play();  
        this.clearItems();
        var pos = {x:0,y:0};
        var itemSubtype = Math.floor(Math.random()*6);
        do {             
            pos.x =  gridAlign (Math.random()*(this.spawnArea.x1 - this.spawnArea.x0) + this.spawnArea.x0) ;
            pos.y = gridAlign(Math.random()*(this.spawnArea.y1 - this.spawnArea.y0)  + this.spawnArea.y0);
        }
        while (!this.map.isPositionsFreeForItem(pos.x/8, pos.y/8));
        
        var item = new Item (pos.x,pos.y,this.itemSpritesheet,itemSubtype, this.itemEffect(itemSubtype));
        this.allItems.push(item);
        
        this.collisionInstance.createStaticCollider({obj:this, type:"item", subtype:itemSubtype, item:item, x:pos.x, y:pos.y}, {x:pos.x,y:pos.y, w:24,h:24}, 
                                        this.defaultCollision,4,4);
    }
    
    this.removeItem = function(item){
        this.removeCollider(item);
        item.itemPicked = true;
        setTimeout((function(self, item) {      //Self-executing func which takes 'this' as self
                         return function() {    //Return a function in the context of 'self'                             
                             var i = self.allItems.indexOf(item);
                             self.allItems.splice(i,1); 
                         };
                     })(this, item),
                     1500 );

       
    }
    
    this.removeCollider = function(item, opt_x, opt_y, type){
        var x = opt_x || item.pos.x;
        var y = opt_y || item.pos.y;
        var t = type || item.type;         
        this.collisionInstance.removeStaticCollider(x,y, t);
    }

    this.clearItems = function(){
        for (var i in this.allItems){
            this.removeCollider(this.allItems[i]);
        }
        this.allItems.splice(0, this.allItems.length);
    }
    
    this.defaultCollision = function(info,other){
        var self = info.obj;
        if (other.type === "player"){
            howlSounds.collectItem.play();
            //(new buzz.sound("sounds/bonus_destroy.wav")).play();
            other.obj.gamePoints += self.itemPoints;
            info.item.castEffect(other.obj, self.map, self.enemySpawner);
            self.removeItem(info.item);
        }
    }

    // the items can affect the player, the map and the enemySpawner
    this.itemEffect = function(itemType){
        if (itemType === 0) {           // estrela
            return function(player, map, eSpawner){
                player.upgradeLevel();
            };
        }
        if (itemType === 1){            // granada
            return function(player, map, eSpawner){
                for (var i=eSpawner.enemies.length-1; i>=0; i--){
                    eSpawner.enemies[i].die(4);
                }
            };
        }
        if (itemType === 2){            // escudo
            return function(player, map, eSpawner){
                player.setShieldOn(15000);
            }
        }
        if (itemType === 3){            // casa de aço
            return function(player, map, eSpawner){
                map.enableSolidBase(15000);
            }
        }
        if (itemType === 4){            // vida +1
            return function(player, map, eSpawner){
                player.lives++;
            }
        }
        if (itemType === 5){            // relogio
            return function(player, map, eSpawner){
                eSpawner.freezeEnemies(10000);
            }
        }
    }
}