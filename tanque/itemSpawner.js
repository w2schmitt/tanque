function itemSpawner(){
    this.itemSpritesheet = null;
    this.spawnArea = {x0:2*32,y0:1*32,x1:18*32,y1:14*32};
    this.allItems = [];
    this.collisionInstance;
    
    this.setSpriteSheets = function(ss){
        this.itemSpritesheet = ss;
    }
    
    this.setCollision = function(col){
        this.collisionInstance = col;
    }
    
    this.spawnItem = function(){
        var pos = {x:0,y:0};
        pos.x =  gridAlign (Math.random()*(this.spawnArea.x1 - this.spawnArea.x0) + this.spawnArea.x0) ;
        pos.y = gridAlign(Math.random()*(this.spawnArea.y1 - this.spawnArea.y0)  + this.spawnArea.y0);
        var itemSubtype = Math.floor(Math.random()*6);
        
        var item = new Item (pos.x,pos.y,this.itemSpritesheet,itemSubtype);
        this.allItems.push(item);
        
        this.collisionInstance.createStaticCollider({obj:this, type:"item", subtype:itemSubtype, item:item, x:pos.x, y:pos.y}, {x:pos.x,y:pos.y, w:32,h:32}, 
                                        this.defaultCollision);
    }
    
    this.removeItem = function(item){
        this.removeCollider(item);
        var i = this.allItems.indexOf(item);
        this.allItems.splice(i,1); 
    }
    
    this.removeCollider = function(item, opt_x, opt_y, type){
        var x = opt_x || item.pos.x;
        var y = opt_y || item.pos.y;
        var t = type || item.type;         
        this.collisionInstance.removeStaticCollider(x,y, t);
    }
    
    this.defaultCollision = function(info,other){
        var self = info.obj;
        if (other.type === "player"){
            self.removeItem(info.item);
            console.log("player pegou item");
        }
    }
}