

function Map(sizeX, sizeY){
    this.tileSize = 8;
    this.size = {x:sizeX/this.tileSize, y:sizeY/this.tileSize};
    this.tiles = {};
    this.map = [];
    this.spriteSheet = null;
    this.spriteSheet8x8 = null;
    this.postDrawTiles = [];
    this.postDrawIndexes = [];
    this.collisionInstance = null;    
    
    this.checkInvisibleColliders = false;
    this.invisibleColliders = [];
    //this.tilesInstance = null;

    // should be called after the building phase
    this.DoneBuilding = function(){
            // create the borders
            this.drawCols(["GRAY"], 0,1,36,37,38,39);
            this.drawRows(["GRAY"], 0,29);

            // put the code to build the player general (flag)

            this.createColliderForTiles();
    }
    
    this.setSpriteSheets = function(ss){
        this.spriteSheet = ss;
    }

    this.setCollisionInstance = function(col){
        this.collisionInstance = col;
    }

    this.createTile = function(){
        for (var v in arguments){
            var tile = arguments[v];
            for (var sub in tile.subTiles){
                this.tiles[tile.subTiles[sub]] = tile;
            }
            this.tiles[tile.name] = tile;
            if (tile.postRendered)
                this.addPostDrawTile(tile.name);
                
        }
    };
    
    this.setTilesInstance = function(instance){
        this.tilesInstance = instance;
    }
    
    // fill entire rows with tile
    this.drawRows = function(tile){
        var i=tile.length;
        for (var row in arguments){
            if (row<1) continue;
            row = arguments[row]*2;
            for (var pos=0; pos<this.map[row].length; pos+=2){  
                var t = this.tiles[tile[i++%tile.length]];
                if (t!=null){
                    t.putItselfInMap(this.map,row,pos);
                } else {
                    console.log ("tile not found", t);
                }                    
            }
        }
    };
    
    // fill entire columns with tile
    this.drawCols = function(tile){
        var i=tile.length;
        for (var col in arguments){
            if (col<1) continue;
            col = arguments[col]*2;
            for (var pos=0; pos<this.map.length; pos+=2){
                var t = this.tiles[tile[i++%tile.length]];
                if (t!=null){
                    t.putItselfInMap(this.map, pos, col);
                } else {
                    console.log ("tile not found", t);
                }   
            }
        }
    };
    
    // line defined as [1,2], [6,10], 
    //H to fill horizontal, V to fill vertical
    this.drawIntervals = function(dir, tile, pos){
        var len=tile.length;        
        for (var i in arguments){
            if (i<3) continue;
            s = arguments[i][0]*2; e = arguments[i][1]*2;
            for (var p in pos){
                p = pos[p]*2;
                for (var r=s; r<=e; r+=2){
                    var t = this.tiles[tile[len%tile.length]];
                    if (t!=null){
                        if (dir=='H'){
                            t.putItselfInMap(this.map, p, r);
                        }else if (dir=='V') {
                            t.putItselfInMap(this.map, r, p);
                        }
                    }
                }
            }
            len++;
        }        
    };
    
    // fill a rectangle with tile
    // rect [x,y, widht, height]
    this.drawRects = function(tile){ 
        var len = tile.length;
        for (var i in arguments){
            if (i<1) continue;
            var x1 = arguments[i][0]*2; var y1 = arguments[i][1]*2;
            var x2 = arguments[i][2]*2; var y2 = arguments[i][3]*2;
            for (var m=0; m<x2; m+=2){
                for (var n=0; n<y2; n+=2){
                     var t = this.tiles[tile[len%tile.length]];
                     if (t!=null)
                        t.putItselfInMap(this.map, y1+n, x1+m);
                }
            }
        }
        len++
    }
    
    // can draw different pattern of blocks at x,y pos --> [ [BRICK, ..., SNOW], [WATER,...,SNOW], ... ]
    this.drawPattern = function(tile,y,x){
        var current_x = x*2;
        var current_y = y*2;
        for (var i in tile){
            tline = tile[i];            
            for (var j in tline ){      
                var t = this.tiles[tline[j]];
                if (t){
                    t.putItselfInMap(this.map, current_y, current_x);
                    current_x+=2;
                }
            }
            current_y+=2;
            current_x = x*2;
        }
    };

    this.setTile = function (tile,y,x){
        this.map[y][x] = tile;
    }

    this.createMap = function (){
        this.map = newArray(this.size.y,[]);
        for (var line in this.map){
            this.map[line] = newArray(this.size.x,"NONE");
        }
    };
    
    //this.setEnumTiles = function(args){
    //    this.enumTiles = args;    
    //    this.createMap();
    //}
    
    this.addPostDrawTile = function(tile){
        this.postDrawTiles.push(tile);
    };
    
    this.drawMap = function(context){
        this.postDrawIndexes = []; //fill this in here because the map can dinamically change in the future
        
        //deal with invisible colliders (this is true only when a map tile is destroyed)
        if (this.checkInvisibleColliders){
            for (var i = this.invisibleColliders.length-1; i>=0; i--){
                var invCol = this.invisibleColliders[i];
                
                if (this.isAroundSquareOfSameType("NONE", invCol.x, invCol.y)){
                    //console.log("inv", "x:",invCol.x, "y:",invCol.y);
                    this.collisionInstance.removeStaticCollider(invCol.x, invCol.y, "invisible");
                    this.invisibleColliders.splice(i,1);
                }
            }
            this.checkInvisibleColliders = false;
        }        
        
        for(var y=0; y<this.size.y; y+=1){
            for (var x=0; x<this.size.x; x+=1){
                    if (contains(this.postDrawTiles, this.map[y][x])){
                        this.postDrawIndexes.push([y,x]);
                        continue;
                    }
                    var tile = this.tiles[this.map[y][x]];
                    if (tile != null){
                        //console.log(tile.size);
                        context.image(this.getSpriteAt(x,y) , x*this.tileSize, y*this.tileSize);
                    } else {
                        //console.log(this.map[y][x]);
                    }
                  
            }
        }
    };
    
    this.postDrawMap = function(context){
        //console.log(this.postDrawIndexes);
        for (var o in this.postDrawIndexes ){
            x = this.postDrawIndexes[o][1];
            y = this.postDrawIndexes[o][0];
            context.image(map1.getSpriteAt(x,y) , x*map1.tileSize, y*map1.tileSize);
        }
    };
    
    this.getSpriteAt = function (x,y){
        return this.spriteSheet.getSprite(this.map[y][x]);
    };
    
    this.createColliderForTiles = function(){
        for(var i=0; i<this.size.y; i+=1){
            for (var j=0; j<this.size.x; j+=1){
                var tile = this.tiles[this.map[i][j]];
                if (tile != null && tile.hasCollider){
                        collision.createStaticCollider({obj:this, type:"tile", subtype:tile.name, x:j, y:i, tile:tile}, {x:j*this.tileSize,y:i*this.tileSize, w:tile.size.x,h:tile.size.y}, 
                                                        this.defaultCollision);
                }
                if (tile != null && tile.drawInvisibleCollider(this.map[i][j])){
                        collision.createStaticCollider({obj:this, type:"invisible", x:j, y:i}, {x:j*this.tileSize, y:i*this.tileSize, w:16,h:16}, function(info,other){});
                        this.invisibleColliders.push({x:j,y:i}); 
                }
            }
        }      
    };
    
    this.removeCollider = function(x,y, type){
        if (this.collisionInstance) {
            this.collisionInstance.removeStaticCollider(x,y, type);
        }
    };
    
    this.defaultCollision = function(info,other){
        var self = info.obj;
        if (other.type === "explosion"){
            if (info.tile.isBreakable){               
                self.removeCollider(info.x, info.y, "tile");
                //console.log("map", "x:", info.x, "y:",info.y);
                self.map[info.y][info.x] = "NONE";                
                //a block was destroyed, mark map check for invisible colliders
                self.checkInvisibleColliders = true;
                //if (self.isAroundSquareOfSameType("NONE", info.x, info.y);
            }
        }
    };

    
    this.isAroundSquareOfSameType = function(type, x,y){
        return (this.map[y][x] === type && this.map[y+1][x] === type && this.map[y][x+1] === type && this.map[y+1][x+1] === type);
    };

   
    
    
}