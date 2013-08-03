


function sketchProc(processing) {
     // it does not seem to work
    /* @pjs preload="cenary.png,player_sprites.png";crips="true"; */
   
    with(processing){  // haha <--- Don't use with... CHUPA  

        //var IA ;
        //var collision;

        // initialize variables (called at start)
        processing.setup = function (){
            
            var resolution = {x:640,y:480}; // 20x15 tiles
            processing.size(resolution.x,resolution.y);   
            processing.frameRate(30);
            
            // Spawner
            var enemySpawner = new Spawner();
            enemySpawner.addEnemyList(["4","2","3","4","4","3","2","3","1","2","4","1"]);
            
            
            //item Spawner
            mItemSpawner = new itemSpawner();
            
            // Collision
            collision = new Collision();   
            
            enemySpawner.setCollision(collision);
            
            // Players
            players = [new Player()]; //, new Player(), new Player()];
            enemies = enemySpawner.enemies;
            //enemies = [];
            
            // Maps
            map1 = new Map(resolution.x, resolution.y);      
            
            var grass = new Tile("GRASS", {x:16,y:16});
                // Tiles creation
            var brick = new Tile("BRICK", {x:8,y:8} );
            brick.setSubTiles(["BRICK_UPPER_LEFT", "BRICK_UPPER_RIGHT", "BRICK_LOWER_LEFT", "BRICK_LOWER_RIGHT"]);
            brick.setIsBreakable(true);
            
            var steel = new Tile("STEEL",{x:16,y:16});
            var water = new Tile("WATER",{x:16,y:16});
            water.bulletPassThrough = true;
            
            var grass = new Tile("GRASS", {x:16,y:16});
            grass.bulletPassThrough = true;
            grass.hasCollider = false;
            grass.postRendered = true;
           
           var snow = new Tile("SNOW", {x:16,y:16});
           snow.bulletPassThrough = true;
           snow.hasCollider = false;
            
            var gray = new Tile("GRAY", {x:16,y:16});
            
              
            // pass the created tiles and setup map
            map1.createTile(brick, steel, water, grass, snow, gray);
            map1.createMap();
            

            // build scenary            
           
            map1.drawRows(["BRICK"], 16,27);
            map1.drawRows(["GRASS","GRASS", "BRICK", "BRICK"],12,13, 23,24);

            //map1.drawRows(["STEEL"], 0,29);
            //map1.drawCols(["STEEL"], 0,39);

            map1.drawIntervals('V',["WATER", "GRASS", "STEEL"], [6,7, 10,11], [6,9], [11,20], [23,25]);
            map1.drawIntervals('H',["WATER"], [6,7], [12,20], [11,20], [23,27]);
            
            map1.drawRects(["SNOW"], [32,14,5,9], [8,14,2,9]);
            
           
            map1.drawPattern([["STEEL","GRASS","GRASS","STEEL"],
                              ["STEEL","GRASS","GRASS","STEEL"]], 18,18);
                              
            map1.drawCols(["GRAY"], 0,1,36,37,38,39);
            map1.drawRows(["GRAY"], 0,29);
            /*           
            map1.setTile(WATER,27,38);
            */
            
            // after the map is complete, create the colliders
            map1.createColliderForTiles(collision);
            
            // create static colliders for the selected tiles
            //map1.createColliderForTiles(collision, ["BRICK_UPPER_LEFT", "BRICK_UPPER_RIGHT", "BRICK_LOWER_LEFT", "BRICK_LOWER_RIGHT", "STEEL", "WATER1", "WATER2", "WATER"]);
            // ----
            
                       // sprites
            playerSpriteSheet = new SpriteSheet(loadImage("player_all.png"));
            enemySpriteSheet = new SpriteSheet(loadImage("enemies1.png"));
            mapSpriteSheet = new SpriteSheet(loadImage("cenary.png"));
            itemSpriteSheet = new SpriteSheet(loadImage("items.png"));
            guiSpriteSheet = new SpriteSheet(loadImage("gui.png"));
            //mapSpriteSheet8x8 = new SpriteSheet(loadImage("cenary.png"));
            
            //players[0].spriteSheet = playerSpriteSheet;
            shootallImg = loadImage("shoot-all.png");
            shootSpriteSheet = new SpriteSheet(shootallImg);
            explosionSpriteSheet = new SpriteSheet(shootallImg); // variavel global explosionSpriteSheet declarada em explosion.js
            //explosion32SpriteSheet = new SpriteSheet(shootallImg);
            
            
            //var explosionTest = new Explosion(6*32,4*32,explosionSpriteSheet, "Big");
            //setting player sprites.. dorgas mano
            for (var i in players){
                //players[i].setSpriteSheets(playerSpriteSheet,shootSpriteSheet,explosionSpriteSheet,playerSpriteSheet );
                players[i].spriteSheet = playerSpriteSheet;
                players[i].explosionSpritesheet = explosionSpriteSheet;
                players[i].bulletSpriteSheet = shootSpriteSheet;
                players[i].spawnSpriteSheet = playerSpriteSheet;
            }
            
            
            mItemSpawner.setSpriteSheets(itemSpriteSheet);//shootSpriteSheet, explosionSs(itemSpriteSheet);
            mItemSpawner.setCollision(collision);
            
            enemySpawner.setSpriteSheets(enemySpriteSheet, shootSpriteSheet, explosionSpriteSheet, playerSpriteSheet);
            map1.spriteSheet = mapSpriteSheet;
            //map1.spriteSheet8x8 = mapSpriteSheet8x8;
            
            cenarySprite = loadImage("cenary.png");             
            tileSprites = {};
            
            // MAP
           
            
            
            // CREATE AN INPUT AND ATTACH IT TO PLAYER 1 <<<<<<<<<<<<<<<<<-----------------------------------------------------------------------------------------
            var input = new Input();
            // list of actions this input can map
            input.setActions( new Enum("up","down", "left", "right" , "fire") );  
            // add attributes that are modified by certain keys according to the binding functions
            input.setKeyAttributes({x:0,y:0,fire:false});
            
            //creating keymap. It associates keycodes with actions. 
            //Primary                                         //Secondary
            with(input){
                input.setSpecialKey(UP,    actions.up);        input.setKey("W", actions.up);
                input.setSpecialKey(DOWN,  actions.down);      input.setKey("S", actions.down);
                input.setSpecialKey(RIGHT, actions.right);     input.setKey("D", actions.right);
                input.setSpecialKey(LEFT,  actions.left);      input.setKey("A", actions.left);
                input.setSpecialKey(ENTER, actions.fire);      input.setKey(" ", actions.fire);
                
                //Keybindings are the functions that are called ONCE on PHYSICAL key press (With no repeat from the OS) AND key release
                //pressed = true -> key pressed; pressed = false -> key released
                input.setBindingFunc(actions.up,    function(input,pressed){ input.keyAttribute.y -= pressed ? 1 : -1; });
                input.setBindingFunc(actions.down,  function(input,pressed){ input.keyAttribute.y += pressed ? 1 : -1; });
                input.setBindingFunc(actions.left,  function(input,pressed){ input.keyAttribute.x -= pressed ? 1 : -1; });
                input.setBindingFunc(actions.right, function(input,pressed){ input.keyAttribute.x += pressed ? 1 : -1; });
                input.setBindingFunc(actions.fire,  function(input,pressed){ input.keyAttribute.fire = pressed; });
            }
            

            //clone will NOT copy the keyMap
            var IA = input.clone();
            enemySpawner.setIAInput(IA);
            /*
            with (input2){
                //set player2 keys:
                setKey("I", actions.up);
                setKey("K", actions.down);
                setKey("L", actions.right);
                setKey("J", actions.left);
                setKey("P", actions.fire);
       }*/
            players[0].setInput(input);  
            players[0].spawningPos = {x:16*20, y:16*25};
            
            for (var p in players){
                players[p].createCollider(collision);
            }

        }; // end setup
         
    
    
      // Override draw function, by default it will be called 60 times per second
    //var tileSpritesCreated = false;
    processing.draw = function() {
        with (this){
            var allEntities = players.concat(enemies);
            
            
            //yes, it is safe to call this method in the loop, it will check if its already loaded
            if (playerSpriteSheet.loaded()){
                if (!playerSpriteSheet.initialized){
                    playerSpriteSheet.createSprites(32,32, 8,9);
                    playerSpriteSheet.setRectSprites( [0,1,8,1], 32,32, ["playerUp1", "playerRight1","playerDown1","playerLeft1", "playerUp2", "playerRight2","playerDown2","playerLeft2"]);    //player1 - frame1 e frame2
                                    
                    playerSpriteSheet.setRectSprites( [4,0,4,1], 32,32, ["spawn1", "spawn2", "spawn3", "spawn4"]);
                    playerSpriteSheet.setRectSprites( [0,0,2,1], 32,32, ["shield1", "shield2"]);
                    
                    playerSpriteSheet.setAnimation(["playerUp1","playerUp2"],"player1Up",15);
                    playerSpriteSheet.setAnimation(["playerRight1","playerRight2"],"player1Right",15);
                    playerSpriteSheet.setAnimation(["playerDown1","playerDown2"],"player1Down",15); 
                    playerSpriteSheet.setAnimation(["playerLeft1","playerLeft2"],"player1Left",15); 
                    
                    playerSpriteSheet.setAnimation(["shield1", "shield2"], "shield", 25);
                    
                    playerSpriteSheet.setAnimation(["spawn4","spawn3","spawn2","spawn1","spawn2","spawn3","spawn4",
                                                    "spawn3","spawn2","spawn1","spawn2","spawn3","spawn4"],"spawn",15);
                }
            }else return false;
            
            if (enemySpriteSheet.loaded()){
                if (!enemySpriteSheet.initialized){
                    enemySpriteSheet.createSprites(32,32, 16,7);                    
                           
                    var t=1;
                    // animation for all the enemies
                    for (var i=1; i<=7; i++){                        
                        if (t>3) t++;
                        enemySpriteSheet.setRectSprites( [0,i-1,8,1], 32,32, ["enemy"+i+"Up1", "enemy"+i+"Right1","enemy"+i+"Down1","enemy"+i+"Left1", "enemy"+i+"Up2", "enemy"+i+"Right2","enemy"+i+"Down2","enemy"+i+"Left2"]);
                        enemySpriteSheet.setAnimation(["enemy"+i+"Up1","enemy"+i+"Up2"],"enemy"+i+"Up",15);
                        enemySpriteSheet.setAnimation(["enemy"+i+"Right1","enemy"+i+"Right2"],"enemy"+i+"Right",15);
                        enemySpriteSheet.setAnimation(["enemy"+i+"Down1","enemy"+i+"Down2"],"enemy"+i+"Down",15); 
                        enemySpriteSheet.setAnimation(["enemy"+i+"Left1","enemy"+i+"Left2"],"enemy"+i+"Left",15); 
                    }
                }
            } else return false;
                            
            if (mapSpriteSheet.loaded()){
                if (!mapSpriteSheet.initialized){
                    mapSpriteSheet.createSprites(16,16, 8,1);
                    mapSpriteSheet.setRectSprites([0,0,8,1], 16,16, ["NONE16", "BRICK", "STEEL", "GRASS", "WATER1", "WATER2", "SNOW", "GRAY"]);
                    mapSpriteSheet.setAnimation(["WATER1","WATER2"],"WATER",1.2);
                    
                    //mapSpriteSheet.createSprites(8,8, 2,2);                   
                    //mapSpriteSheet.setRectSprites([0,1,0,1], 8,8, ["BRICK_UPPER_LEFT", "BRICK_UPPER_RIGHT", "BRICK_BOTTOM_LEFT", "BRICK_BOTTOM_RIGHT"]);      
                    
                    mapSpriteSheet.createSprites(8,8, 4,2);                   
                    mapSpriteSheet.setRectSprites([2,0,2,2], 8,8, ["BRICK_UPPER_LEFT", "BRICK_UPPER_RIGHT", "BRICK_LOWER_LEFT", "BRICK_LOWER_RIGHT"]);        
                    mapSpriteSheet.setRectSprites([0,0,1,1], 8,8, ["NONE"]);
                    
                    //mapSpriteSheet.createSprites(8,8,1,1);
                    //mapSpriteSheet.setRectSprites([0,0,0,0], 8,8, ["NONE"]);   
                }
            }else return false;

           if (itemSpriteSheet.loaded()){
                if (!itemSpriteSheet.initialized){
                    itemSpriteSheet.createSprites(32,32, 7,1 );
                    itemSpriteSheet.setRectSprites([0,0,7,1],32,32, ["i0","i1","i2","i3","i4","i5", "blank"]);
                    
                    itemSpriteSheet.setAnimation(["i0", "blank"], "item0", 3);
                    itemSpriteSheet.setAnimation(["i1", "blank"], "item1", 3);
                    itemSpriteSheet.setAnimation(["i2", "blank"], "item2", 3);
                    itemSpriteSheet.setAnimation(["i3", "blank"], "item3", 3);
                    itemSpriteSheet.setAnimation(["i4", "blank"], "item4", 3);
                    itemSpriteSheet.setAnimation(["i5", "blank"], "item5", 3);
                }                
            }else return false;
            
            if (guiSpriteSheet.loaded()){
                if (!guiSpriteSheet.initialized){
                    guiSpriteSheet.createSprites(16,16, 1, 2);
                    guiSpriteSheet.setRectSprites([0,0,1,2],16,16, ["enemyIcon","playerIcon"]);
                    
                    guiSpriteSheet.createSprites(32,32, 1, 1, 16, 0);
                    guiSpriteSheet.setRectSprites([0,0,1,1],32,32, ["flagIcon"]);
                    
                }
            }
            
            
            if (shootSpriteSheet.loaded()){
                if (!shootSpriteSheet.initialized){
                    shootSpriteSheet.createSprites(16,16, 4,1 );
                    shootSpriteSheet.setRectSprites([0,0,4,1],16,16, ["bulletUp","bulletLeft","bulletRight","bulletDown"]);
                }                
            }else return false;
            //nao rpecisa mais dar upodate nso spreadSHITs pra animar os sprites :) funciona por mágica agora
            //playerSpriteSheet.update();
            
            
            
            if(explosionSpriteSheet.loaded()){
                if (!explosionSpriteSheet.initialized){
                    explosionSpriteSheet.createSprites(32,32, 3,1,16*4,0); //offset inicial pra n pegar as bullets
                    explosionSpriteSheet.setRectSprites( [0,0,3,1], 32,32, ["explosionSmall1", "explosionSmall2", "explosionSmall3"]);
                    
                    explosionSpriteSheet.createSprites(64,64, 3,1,16*4 + 32*3,0); //offset inicial pra n pegar as bullets e explosoes pequenas
                    explosionSpriteSheet.setRectSprites( [0,0,2,1], 64,64, ["explosionBig1", "explosionBig2"]);
                    
                    
                    explosionSpriteSheet.setAnimation(["explosionSmall1","explosionSmall2","explosionSmall3"],"explosionSmall",15, false);
                    explosionSpriteSheet.setAnimation(["explosionSmall1","explosionSmall2","explosionSmall3", //small start
                                                        "explosionBig1", "explosionBig2"  ,"explosionSmall3"], //small end
                                            "explosionBig",15,false);
                
                
                }
            }else return false;
            
            for (var e in enemies){
                
                var IA = enemies[e].input;
                //IA MTO BOA:
                if (random(25) < 1){
                    IA.value.x = Math.floor(random(3)) -1;
                }
                if (random(20) < 1){
                    IA.value.y = Math.floor(random(3)) -1;
                }
                
                if (random(20) < 1){
                    IA.value.y = Math.floor(random(3)) -1;
                }
                IA.value.fire = (Math.floor(random(3)) == 0);
            }
            
            //item random em momento random
            if (random(60 ) < 1){
                mItemSpawner.spawnItem();
            }
           
            
            //update player position
            //do a tree node hierarchy in the future (wut? não consegui gravar)
            for (var p in allEntities){
                allEntities[p].update();
            }
            
          
                  
                      
            collision.computeCollisions();
            
            
            // erase background
            processing.background(0);
            
            
            
            
            // draw map
            map1.drawMap(processing);

            //draw items:
            for(var i in mItemSpawner.allItems){
                var item = mItemSpawner.allItems[i];
                item.update();
                 if (item.currentSprite != null){
                    image(item.currentSprite, item.pos.x, item.pos.y); 
                }
            }
             
            for (var i in allEntities){
                var p = allEntities[i];   
                if (!p.isDead){
                    image(p.currentSprite, p.pos.x, p.pos.y); 
                                    if (p.shieldSprite !== null)
        image(p.shieldSprite, p.pos.x, p.pos.y); 
                }
                     // draw players bullets
                for (var b in p.bullets){
                    b = p.bullets[b];
                    image(b.currentSprite, b.pos.x, b.pos.y);
                }
                 }
            
            //draw explosions
            for (var i in allExplosions){
                imageMode(CENTER);
                var e = allExplosions[i];
                e.update();
                if (e.currentSprite != null){
                    image(e.currentSprite, e.pos.x, e.pos.y); 
                }
                imageMode(CORNER);
            }
            
            //remove the explosions that have to be removed
            for (var i = 0; i < allExplosions.length ; i++){
                 var e = allExplosions[i];
                 if (e.remove){
                     delete allExplosions[i];
                     allExplosions.splice(i,1);
                     i--;
                 } 
            }
            
            //draw map (processing need to use image function)
            map1.postDrawMap(processing);

            
            // DEBUG MODE FOR COLLIDERS
            //collision.drawAllColliders(processing);
        }
      };
    
    
        
        
        processing.keyPressed = function(){ 
          var all = players.concat(enemies);
          for(var p in all){              
              input = all[p].input;
              if (input.keymap[keyCode] != null && !input.inputPressed[input.keymap[keyCode]]){
                input.inputPressed[input.keymap[keyCode]] = true;
                input.keybindings[input.keymap[keyCode]].apply(this,[input,true]);
            }              
          }
               
        };
        
        processing.keyReleased = function(){ 
            var all = players.concat(enemies);
            for(var p in all){
                input = all[p].input;
                if (input.keymap[keyCode] != null && input.inputPressed[input.keymap[keyCode]]){
                    input.inputPressed[input.keymap[keyCode]] = false;
                    input.keybindings[input.keymap[keyCode]].apply(this,[input,false]);
                }
            } 
        };
        
    } //with processing
}


var canvas = document.getElementById("lixo");
// attaching the sketchProc function to the canvas
var processingInstance = new Processing(canvas, sketchProc);


