// tile struct
function Tile(name, size, func){
    this.name = name;
    this.subTiles = [];
    this.size = size;
    this.hasSubtiles = false;
    this.needInvisibleCollider = false;
    this.isBreakable = false;
    this.bulletPassThrough = false;
    this.hasCollider = true;
    this.postRendered = false;
    
    this.setSubTiles = function(subTiles){
        this.hasSubtiles = true;
        this.needInvisibleCollider = true;
        this.subTiles = subTiles;
    }
    
    this.setIsBreakable = function(value){
        this.isBreakable = true;
    }
    
    this.setbulletPassThrough = function(value){
        this.bulletPassThrough = value;
    }
    
    this.drawInvisibleCollider = function(subTileName){
        return (this.needInvisibleCollider && subTileName === this.subTiles[0]);
    }
    
    
    this.defaultDrawFunction = function(map, y, x){
        map[y][x]     = this.subTiles[0] || this.name;
        map[y+1][x]   = this.subTiles[1] || "NONE";
        map[y][x+1]   = this.subTiles[2] || "NONE";
        map[y+1][x+1] = this.subTiles[3] || "NONE";                
    }
    
    
    this.putItselfInMap = func || this.defaultDrawFunction; // alias
    
    
    
}


/* Dont need this shit, this will be included in Map
//interface to create tiles
function Tiles(){
    
   this.tiles = [];
    
    this.createTile = function(name){
        var t = new Tile(name);        
        this.tiles.push(t);
    }
    
    this.getTileByName = function(name){
        
    }
    
    
}
*/