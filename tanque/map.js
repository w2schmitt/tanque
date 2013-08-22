
tileNames = ["NONE","BRICK","STEEL","GRASS","WATER","WATER","SNOW","GRAY"];

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
    this.currentMap = -1;
    this.borders = {left:4, right:10, top:2, bottom:2};
    this.enemySpawnerInstance;
    
    this.checkInvisibleColliders = false;
    this.invisibleColliders = [];
    this.baseCollidersRef = [];
    this.drawingHouse = false;
    //this.tilesInstance = null;

    this.setEnemySpawnerInstance = function(esi){
        this.enemySpawnerInstance = esi;
    }
    // should be called after the building phase
    this.DoneBuilding = function(){
        // create the borders
        //this.drawRows(["SNOW"], 27,26,25,24,23);
        this.drawCols(["GRAY"], 0,1,2,3, 30,31,32,33,34,35,36,37,38,39);
        this.drawRows(["GRAY"], 0,1,28,29);
       

        // put the code to build the player general base (flag)
        this.drawingHouse = true;
        this.drawIntervals('V', ["BRICK"], [15,18], [26,27]);
        this.drawIntervals('H', ["BRICK"], [25], [15,18]);
        this.drawingHouse = false;
        /*
        this.baseCollidersRef.push([17*2,26*2,"BRICK"], [17*2,27*2,"BRICK"], [17*2,28*2,"BRICK"],
                                   [20,26,"BRICK"], [20,27,"BRICK"], [20,28,"BRICK"],
                               aw    [18,26,"BRICK"], [19,26,"BRICK"]);
        */
        this.createColliderForTiles();
    }

    this.loadMap = function(){        
        this.createMap();
        var layer = stages[this.currentMap].layers[0];
        this.enemySpawnerInstance.addEnemyList(stages[this.currentMap].enemies.slice(0));//clone
        
        var currentPos = 0;
        for (var y=this.borders.top*2; y<this.size.y-this.borders.bottom*2; y+=2){
            for (var x=this.borders.left*2; x<this.size.x-this.borders.right*2; x+=2 ){
                //console.log(layer.data[currentPos++]-1);
                var tile = this.tiles[tileNames[layer.data[currentPos++]-1]];                
                if (tile != null)
                    tile.putItselfInMap(this.map, y,x);                
            }
        }
        
        this.DoneBuilding();
    }
    


    this.enableSolidBase = function(time){
        for (var i in this.baseCollidersRef){
            var col = this.baseCollidersRef[i];
            this.removeTile(col[0],col[1]);
            this.map[col[0]][col[1]] = "STEEL";
            var tile = this.tiles["STEEL"];
            this.collisionInstance.createStaticCollider({obj:this, type:"tile", subtype:tile.name, x:col[1], y:col[0], tile:tile}, {x:col[1]*this.tileSize,y:col[0]*this.tileSize, w:tile.size.x,h:tile.size.y}, 
                                                        this.defaultCollision);
            //console.log(col[0], col[1], this.map[col[0]][col[1]]);
            //this.collisionInstance.modifyStaticCollider(col[0], col[1], col[2], ["type", "STEEL"]);
        }

        setTimeout((function(self) {            //Self-executing func which takes 'this' as self
                         return function() {    //Return a function in the context of 'self'                             
                             self.disableSolidBase(); 
                         };
                     })(this),
                     time );
    }

    this.disableSolidBase = function(){
        for (var i in this.baseCollidersRef){
            var col = this.baseCollidersRef[i];
            this.removeTile(col[0],col[1]);
            var tile = this.tiles["BRICK"];
            tile.putItselfInMap(this.map, col[0], col[1]);


            //this.collisionInstance.createStaticCollider({obj:this, type:"tile", subtype:tile.name, x:col[1], y:col[0], tile:tile}, {x:col[1]*this.tileSize,y:col[0]*this.tileSize, w:tile.size.x,h:tile.size.y}, 
                                                        //this.defaultCollision);
        }

        this.createColliderForTiles();
    }

    this.removeTile = function(y,x){
        //console.log(this.map[y][x]);
        this.map[y][x]     = "NONE"
        this.map[y+1][x]   = "NONE";
        this.map[y][x+1]   = "NONE";
        this.map[y+1][x+1] = "NONE";

        this.removeCollider(x,y,"tile");
        this.removeCollider(x+1,y,"tile");
        this.removeCollider(x,y+1,"tile");
        this.removeCollider(x+1,y+1,"tile");

        this.checkInvisibleColliders = true;
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
                            if (this.drawingHouse) this.baseCollidersRef.push([p,r,"BRICK"]);
                        }else if (dir=='V') {
                            t.putItselfInMap(this.map, r, p);
                            if (this.drawingHouse) this.baseCollidersRef.push([r,p,"BRICK"]);
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
        
        this.collisionInstance.clearStaticCollidersOfType("tile","invisible");
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
                
                if (this.isAroundSquareOfSameType("NONE",invCol.x, invCol.y) || 
                    this.map[invCol.y][invCol.x] === "STEEL") {
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
                if (this.collisionInstance.existsStaticCollider(j,i,"tile")){
                    continue;
                }
                if (tile != null && tile.hasCollider){
                        this.collisionInstance.createStaticCollider({obj:this, type:"tile", subtype:tile.name, x:j, y:i, tile:tile}, {x:j*this.tileSize,y:i*this.tileSize, w:tile.size.x,h:tile.size.y}, 
                                                        this.defaultCollision);
                }
                if (tile != null && tile.drawInvisibleCollider(this.map[i][j])){
                        this.collisionInstance.createStaticCollider({obj:this, type:"invisible", x:j, y:i}, {x:j*this.tileSize, y:i*this.tileSize, w:16,h:16}, function(info,other){});
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

            if (info.tile.isBreakable || (other.obj.breakSteel && info.subtype=="STEEL")){
                self.removeCollider(info.x, info.y, "tile");
                self.map[info.y][info.x] = "NONE";                
                //a block was destroyed, mark map check for invisible colliders
                self.checkInvisibleColliders = true;
                //if (self.isAroundSquareOfSameType("NONE", info.x, info.y);
            } 
            other.obj.exploded = true;
        }
    };

    this.isAroundSquareOfSameType = function(type, x,y){
        return (this.map[y][x] === type && this.map[y+1][x] === type && this.map[y][x+1] === type && this.map[y+1][x+1] === type);
    };

    this.isPositionsFreeForItem = function(x,y){
        var tile1 = this.tiles[this.map[y][x]];
        var tile2 = this.tiles[this.map[y+2][x]];
        var tile3 = this.tiles[this.map[y][x+2]];
        var tile4 = this.tiles[this.map[y+2][x+2]];

        //console.log(tile1.name,tile2.name,tile3.name,tile4.name);

        return (tile1 == undefined  || tile2 == undefined  || tile3 == undefined  || tile4 == undefined) ||
               (tile1.itemFree || tile2.itemFree || tile3.itemFree || tile4.itemFree)

    }
}