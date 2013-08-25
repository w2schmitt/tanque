


function sketchProc(processing) {
     
    loadedSounds=0;
    howlSounds = {
        numberOfSounds: 11,
        gameStart: (new Howl({urls: ['sounds/Game_Start.mp3' ], onload:function(){loadedSounds++} })) ,
        gameOver:  (new Howl({urls: ['sounds/Game_Over.mp3'  ], onload:function(){loadedSounds++} })) ,
        playerShot:(new Howl({urls: ['sounds/player_shot.wav'], onload:function(){loadedSounds++} })) ,
        hitBrick:  (new Howl({urls: ['sounds/hit_brick1.wav'], onload:function(){loadedSounds++} })) ,
        hitWall:   (new Howl({urls: ['sounds/hit_wall.wav'], onload:function(){loadedSounds++} })) ,
        hitArmor:  (new Howl({urls: ['sounds/hit_armor.wav'], onload:function(){loadedSounds++} })) ,
        enemyExplosion: (new Howl({urls: ['sounds/enemy_explode.wav'], onload:function(){loadedSounds++} })) ,
        playerExplosion: (new Howl({urls: ['sounds/player_explode.wav'], onload:function(){loadedSounds++} })) ,
        spawnItem: (new Howl({urls: ['sounds/bonus_appear.wav'], onload:function(){loadedSounds++} })) ,
        collectItem: (new Howl({urls: ['sounds/bonus_destroy.wav'], onload:function(){loadedSounds++} })) ,
        song: (new Howl({urls: ['sounds/song2.mp3','sounds/song2.ogg'], buffer:true, loop:true, onload:function(){loadedSounds++} }))
        //tankEngine: (new Howl({urls: ['sounds/player_engine2.mp3'], loop:true, buffer:true, onload:function(){ loadedSounds++} }))
        //engineIdle: (new Howl({urls: ['sounds/tank_idle.wav'], loop:true, autoplay:true, onload:function(){loadedSounds++} })) 
    };
    

   
    //gameSounds.engine.load();
    //gameSounds.engine.setTime(14);

   
    with(processing){  // haha <--- Don't use with... CHUPA  

        // initialize variables (called at start)
        processing.setup = function (){


            startGame = 0;
            var resolution = {x:640,y:480}; // 20x15 tiles
            processing.size(resolution.x,resolution.y);   
            processing.frameRate(60);
            
            // Collision
            collision = new Collision();   

            // Game GUI
			gMenu = new GameMenu();

            //general Flag
            baseFlag = new General();
            baseFlag.setCollision(collision);

            //item Spawner
            mItemSpawner = new itemSpawner();
            mItemSpawner.setCollision(collision);            
			
            // Spawners
            enemySpawner = new Spawner();
            enemySpawner.setCollision(collision);
            enemySpawner.setItemSpawner(mItemSpawner);

            // Players
            players = [new Player()];
            players[0].spawningPos = {x:16*13, y:16*26};
            players[0].upgradeLevel(1);

            for (var p in players){players[p].setCollisionInstance(collision);}
            
            enemies = enemySpawner.enemies; // create alias array for the enemy spanwer enemies
              
            // Map Tiles
            var brick = new Tile("BRICK", {x:8,y:8} );
            brick.setSubTiles(["BRICK_UPPER_LEFT", "BRICK_UPPER_RIGHT", "BRICK_LOWER_LEFT", "BRICK_LOWER_RIGHT"]);
            brick.setIsBreakable(true);
            
            var steel = new Tile("STEEL",{x:16,y:16});
            steel.itemFree = false;

            var water = new Tile("WATER",{x:16,y:16});
            water.bulletPassThrough = true;
            water.itemFree = false;
            
            var grass = new Tile("GRASS", {x:16,y:16});
            grass.bulletPassThrough = true;
            grass.hasCollider = false;
            grass.postRendered = true;
           
            var snow = new Tile("SNOW", {x:16,y:16});
            snow.bulletPassThrough = true;
            snow.playerPassThrough = true;
            snow.isSlippery = true;
            //snow.hasCollider = false;
            
            var gray = new Tile("GRAY", {x:16,y:16});
            gray.itemFree = false;
              
            // create map and pass the created tiles
            map1 = new Map(resolution.x, resolution.y);
            map1.setCollisionInstance(collision);
            map1.setEnemySpawnerInstance(enemySpawner);
            map1.createTile(brick, steel, water, grass, snow, gray);
            
            // sprites
            playerSpriteSheet = new SpriteSheet(loadImage("player_all.png"));
            enemySpriteSheet = new SpriteSheet(loadImage("enemies1.png"));
            mapSpriteSheet = new SpriteSheet(loadImage("cenary.png"));
            itemSpriteSheet = new SpriteSheet(loadImage("items.png"));
            guiSpriteSheet = new SpriteSheet(loadImage("gui.png"));
            shootallImg = loadImage("shoot-all.png");
            shootSpriteSheet = new SpriteSheet(shootallImg);
            explosionSpriteSheet = new SpriteSheet(shootallImg); // variavel global explosionSpriteSheet declarada em explosion.js           
            
            for (var i in players){
                players[i].spriteSheet = playerSpriteSheet;
                players[i].explosionSpritesheet = explosionSpriteSheet;
                players[i].bulletSpriteSheet = shootSpriteSheet;
                players[i].spawnSpriteSheet = playerSpriteSheet;
            }  

            gMenu.setSpriteSheet(guiSpriteSheet);
            mItemSpawner.setSpriteSheets(itemSpriteSheet);   
            enemySpawner.setSpriteSheets(enemySpriteSheet, shootSpriteSheet, explosionSpriteSheet, playerSpriteSheet);
            map1.setSpriteSheets(mapSpriteSheet);
            baseFlag.setSpriteSheet(playerSpriteSheet);
            baseFlag.setExplosionSpriteSheet(explosionSpriteSheet);
            
            
            // Create Input for players and IA
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
                input.setMouseButton(LEFT, actions.fire); input.setKey(" ", actions.fire);
                
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
 
            players[0].setInput(input);  

            mItemSpawner.setMapInstance(map1);
            mItemSpawner.setEnemySpawnerInstance(enemySpawner);

            //mItemSpawner.spawnItem();

            // Collisions Callback
            setInterval((function(col) {        
                         return function() { col.computeCollisions(); }; 
                        })(collision), 5 );
                        
                        
            //Highscores handler
            highscores = new Highscores(); 
            highscores.bind("top10");
        };  // end setup
        
    
    
    // Override draw function, by default it will be called 60 times per second
    processing.draw = function() {
        with (this){

            //loading sounds
            if (howlSounds < howlSounds.numberOfSounds){
                return false;
            }
            
            if (startGame === 0) {  // put things that need to load only 1 time before the new stage starts
                //gameSounds.gameStart.play();
                //howlSounds.song.stop();
                howlSounds.gameStart.play();
                startGame++;
                mItemSpawner.clearItems();
                baseFlag.recreateFlag();
                players[0].isFrozen = false;
                enemySpawner.clearEnemies();
                map1.currentMap = (map1.currentMap+1)%stages.length;
                map1.loadMap();
                players[0].spawnPlayer();
                players[0].removeAllBullets();
                setTimeout(function() { startGame=3; /*howlSounds.song.fadeIn(0.6,2000);*/ }, 4200 );
                      
                return false;
            } else if (startGame === 1){    //show Menu window
                background(127,127,127);
                fill(255,255,255);
                textSize(30);        
                text("level "+(map1.currentMap+1), 320-50, 240);
                return false;
            }
            
            // end stage
            if (enemySpawner.allEnemiesDead() && startGame===3){
                startGame=4;
                //howlSounds.song.fadeOut(0,3000);
                setTimeout(function() { startGame=0; }, 5000 );
            }

            //gameover
            if ((players[0].lives < 0 || baseFlag.isDead) && startGame===3){
                
                
                function promptHighScoreAndSend(){
                    var playerName = prompt("You made "+ players[0].gamePoints + " points!\nPlease enter your name","AAA");
                    
                    if (playerName!=null && playerName!=""){
                        sendScore(players[0].gamePoints,playerName);
                    }
                }
                
                setTimeout(promptHighScoreAndSend,2000);
                howlSounds.gameOver.play();
                players[0].setShieldOff();// = false;
                if (!baseFlag.isDead){                   
                    players[0].pos.x = 10000;
                    players[0].pos.y = 10000;
                } else {
                    players[0].freeze();
                }
               
                startGame=2;                
                setTimeout(function() { startGame=5; }, 5000 );
                setTimeout(function() { startGame=0; 
                                        players[0].lives = 4; 
                                        map1.currentMap = -1; 
                                        players[0].gamePoints = 0;  
                                        players[0].upgradeLevel(1);}, 5000+8000 );
            }
            
            //draw highscores
            if (startGame===5){
                //startGame=2;
                background(127,127,127);
                fill(255,255,255);
                textSize(30);        
                text("Highscores", 320-80, 100);
                
                highscores.refreshHighScore(false);
                text(highscores.getAsText(10), 320-120, 140);
                
                return false;
            }


            
            // create an array containing enemies and players
            var allEntities = players.concat(enemies); 
            gMenu.setNumberOfEnemies(enemySpawner.totalEnemies);   
            gMenu.setPlayerPoints(0,players[0].gamePoints);   
            gMenu.currentMap = map1.currentMap;
            gMenu.numOflives = players[0].lives;


            
            //yes, it is safe to call this method in the loop, it will check if its already loaded
            if (playerSpriteSheet.loaded()){
                if (!playerSpriteSheet.initialized){
                    playerSpriteSheet.createSprites(32,32, 8,9);
                    for (var i=1; i<=4; i++){
                        playerSpriteSheet.setRectSprites( [0,i,8,1], 32,32, ["playerUp1"+i, "playerRight1"+i,"playerDown1"+i,"playerLeft1"+i, "playerUp2"+i, "playerRight2"+i,"playerDown2"+i,"playerLeft2"+i]);
                        playerSpriteSheet.setAnimation(["playerUp1"+i,"playerUp2"+i],"player1Up"+i,15);
                        playerSpriteSheet.setAnimation(["playerRight1"+i,"playerRight2"+i],"player1Right"+i,15);
                        playerSpriteSheet.setAnimation(["playerDown1"+i,"playerDown2"+i],"player1Down"+i,15); 
                        playerSpriteSheet.setAnimation(["playerLeft1"+i,"playerLeft2"+i],"player1Left"+i,15); 
                    }
                                    
                    playerSpriteSheet.setRectSprites( [4,0,4,1], 32,32, ["spawn1", "spawn2", "spawn3", "spawn4"]);
                    playerSpriteSheet.setRectSprites( [0,0,2,1], 32,32, ["shield1", "shield2"]);
                    playerSpriteSheet.setRectSprites( [2,0,2,1], 32,32, ["generalAlive", "generalDead"]);

                    playerSpriteSheet.setAnimation(["shield1", "shield2"], "shield", 35);
                    
                    playerSpriteSheet.setAnimation(["spawn4","spawn3","spawn2","spawn1","spawn2","spawn3","spawn4",
                                                    "spawn3","spawn2","spawn1","spawn2","spawn3","spawn4"],"spawn",15);
                }
            }else return false;
            
            if (enemySpriteSheet.loaded()){
                if (!enemySpriteSheet.initialized){
                    enemySpriteSheet.createSprites(32,32, 16,7);                    
                           
                    var t=1;
                    // animation for normal the enemies
                    for (var i=1; i<=7; i++){                        
                        if (t>3) t++;
                        enemySpriteSheet.setRectSprites( [0,i-1,8,1], 32,32, ["enemy"+i+"Up1", "enemy"+i+"Right1","enemy"+i+"Down1","enemy"+i+"Left1", "enemy"+i+"Up2", "enemy"+i+"Right2","enemy"+i+"Down2","enemy"+i+"Left2"]);
                        if (i<5) {
                            enemySpriteSheet.setRectSprites( [8,i-1,8,1], 32,32, ["specialenemy"+i+"Up1", "specialenemy"+i+"Right1","specialenemy"+i+"Down1","specialenemy"+i+"Left1", "specialenemy"+i+"Up2", "specialenemy"+i+"Right2","specialenemy"+i+"Down2","specialenemy"+i+"Left2"]);
                            enemySpriteSheet.setAnimation(["enemy"+i+"Up1"    ,"specialenemy"+i+"Up2"   , "enemy"+i+"Up1"    , "specialenemy"+i+"Up2"   ], "specialenemy"+i+"Up"    ,10);
                            enemySpriteSheet.setAnimation(["enemy"+i+"Right1" ,"specialenemy"+i+"Right2", "enemy"+i+"Right1" , "specialenemy"+i+"Right2"], "specialenemy"+i+"Right" ,10);
                            enemySpriteSheet.setAnimation(["enemy"+i+"Down1"  ,"specialenemy"+i+"Down2" , "enemy"+i+"Down1"  , "specialenemy"+i+"Down2" ], "specialenemy"+i+"Down"  ,10); 
                            enemySpriteSheet.setAnimation(["enemy"+i+"Left1"  ,"specialenemy"+i+"Left2" , "enemy"+i+"Left1"  , "specialenemy"+i+"Left2" ], "specialenemy"+i+"Left"  ,10); 
                        }

                        enemySpriteSheet.setAnimation(["enemy"+i+"Up1"    ,"enemy"+i+"Up2"   ] ,"enemy"+i+"Up"    ,15);
                        enemySpriteSheet.setAnimation(["enemy"+i+"Right1" ,"enemy"+i+"Right2"] ,"enemy"+i+"Right" ,15);
                        enemySpriteSheet.setAnimation(["enemy"+i+"Down1"  ,"enemy"+i+"Down2" ] ,"enemy"+i+"Down"  ,15); 
                        enemySpriteSheet.setAnimation(["enemy"+i+"Left1"  ,"enemy"+i+"Left2" ] ,"enemy"+i+"Left"  ,15); 
                    }
                }
            }else return false;
                            
            if (mapSpriteSheet.loaded()){
                if (!mapSpriteSheet.initialized){
                    mapSpriteSheet.createSprites(16,16, 8,1);
                    mapSpriteSheet.setRectSprites([0,0,8,1], 16,16, ["NONE16", "BRICK", "STEEL", "GRASS", "WATER1", "WATER2", "SNOW", "GRAY"]);
                    mapSpriteSheet.setAnimation(["WATER1","WATER2"],"WATER",1.2);  
                    
                    mapSpriteSheet.createSprites(8,8, 4,2);                   
                    mapSpriteSheet.setRectSprites([2,0,2,2], 8,8, ["BRICK_UPPER_LEFT", "BRICK_UPPER_RIGHT", "BRICK_LOWER_LEFT", "BRICK_LOWER_RIGHT"]);        
                    mapSpriteSheet.setRectSprites([0,0,1,1], 8,8, ["NONE"]); 
                }
            }else return false;

           if (itemSpriteSheet.loaded()){
                if (!itemSpriteSheet.initialized){
                    itemSpriteSheet.createSprites(32,32, 8,1 );
                    itemSpriteSheet.setRectSprites([0,0,8,1],32,32, ["i0","i1","i2","i3","i4","i5", "blank", "500points"]);
                    
                    for (var i=0; i<=5; i++){
                        itemSpriteSheet.setAnimation(["i"+i, "blank"], "item"+i, 8);
                    }
                }                
            }else return false;
            
            if (guiSpriteSheet.loaded()){
                if (!guiSpriteSheet.initialized){
                    guiSpriteSheet.createSprites(16,16, 1, 2);
                    guiSpriteSheet.setRectSprites([0,0,1,2],16,16, ["enemyIcon","playerIcon"]);
                    
                    guiSpriteSheet.createSprites(32,32, 1, 1, 16, 0);
                    guiSpriteSheet.setRectSprites([0,0,1,1],32,32, ["flagIcon"]);
                    
                }
            }else return false;
            
            if (shootSpriteSheet.loaded()){
                if (!shootSpriteSheet.initialized){
                    shootSpriteSheet.createSprites(16,16, 2,2 );
                    shootSpriteSheet.setRectSprites([0,0,2,2],16,16, ["bulletUp","bulletLeft","bulletRight","bulletDown"]);
                }                
            }else return false;
            
            if(explosionSpriteSheet.loaded()){
                if (!explosionSpriteSheet.initialized){
                    explosionSpriteSheet.createSprites(32,32, 4,2,16*2,0); //offset inicial pra n pegar as bullets
                    explosionSpriteSheet.setRectSprites( [0,0,4,1], 32,32, ["explosionSmall1", "explosionSmall2", "explosionSmall3", "0points"]);
                    explosionSpriteSheet.setRectSprites( [0,1,4,1], 32,32, ["100points","200points","300points","400points"]);
                    
                    explosionSpriteSheet.createSprites(64,64, 3,1,16*2 + 32*4,0); //offset inicial pra n pegar as bullets e explosoes pequenas
                    explosionSpriteSheet.setRectSprites( [0,0,2,1], 64,64, ["explosionBig1", "explosionBig2"]);
                    
                    explosionSpriteSheet.setAnimation(["explosionSmall1","explosionSmall2","explosionSmall3"],"explosionSmall",15, false);
                    explosionSpriteSheet.setAnimation(["explosionSmall1","explosionSmall2","explosionSmall3", //small start
                                                       "explosionBig1", "explosionBig2"  ,"explosionSmall3", "0points"], //small end
                                                       "explosionBig",15,false);
                    for (var i=1; i<=4; i++){
                        explosionSpriteSheet.setAnimation(["explosionSmall1","explosionSmall2","explosionSmall3", //small start
                                                            "explosionBig1", "explosionBig2"  ,"explosionSmall3", i*100+"points"], //small end
                                                            "explosionBig"+i*100,15,false);
                    }
                }
            }else return false;

            

            // move IA
            for (var e in enemies){    
                var enemy = enemies[e];
                var IA = enemies[e].input;
                //IA MTO BOA:
                
                IA.value.fire =  (Math.floor(random(20)) == 0);
                 
                //probability of change:
                if (enemy.isColliding)
                    enemy.probOfChangeDirection-=30;
                    
                if (random(enemy.probOfChangeDirection--) < 1 && enemy.probOfChangeDirection<260 || 
                    (IA.value.x === 0 && IA.value.y === 0)){
                    enemy.probOfChangeDirection=300;
                    IA.value.x = 0;
                    IA.value.y = 0;
                        
                    //higher probability of vertical movement 
                    //console.log(random(3));
                    if (random(3) > 1.35){
                        //higher probability of going down
                        IA.value.y = 1;//(random (5) > 1)?1:0 
                    }else{
                        //same horizontam prob:
                        if (random(6) > 1)
                            IA.value.x = (random (2) > 1)?1:-1  
                        else
                            IA.value.y = -1;
                    }
                }
                /*if (random(25) < 1){
                    IA.value.x = Math.floor(random(3)) -1;
                } 
                if (random(20) < 1){
                    IA.value.y = Math.floor(random(3)) -1;
                } 
                if (random(20) < 1){
                    IA.value.y = Math.floor(random(3)) -1;
                }                
                IA.value.fire = (Math.floor(random(3)) == 0);*/
            }          
            
            //update player position
            //do a tree node hierarchy in the future (wut? não consegui gravar)
            for (var p in allEntities){
                allEntities[p].update();
            }
            
            // do the realistic physics computations
            //collision.computeCollisions();
            
            
            // DRAWING COMMANDS
            // erase background
            processing.background(0);

            //draw baseFlag
            processing.image(baseFlag.getCurrentSprite(), baseFlag.pos.x, baseFlag.pos.y, 32,32);

            // draw map
            map1.drawMap(processing);
             
            // draw player and enemies
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

            // draw tiles rendered after the player
            map1.postDrawMap(processing);

            //draw items:
            for(var i in mItemSpawner.allItems){
                var item = mItemSpawner.allItems[i];
                item.update();
                if (item.currentSprite != null){
                    image(item.currentSprite, item.pos.x, item.pos.y); 
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
                        
            gMenu.drawMenu(processing);
            if (startGame === 2){
                fill(255,0,0);
                textSize(40); 
                text("Game Over", 320-145, 240);  
            }

            // DEBUG MODE FOR COLLIDERS
            //collision.drawAllColliders(processing);
        }
      };
    
        processing.mousePressed = function(){
            var all = players;//.concat(enemies);
            for(var p in all){ 
                input = all[p].input; 
                if (input.keymap["MOUSE_"+mouseButton] != null && !input.inputPressed[input.keymap["MOUSE_"+mouseButton]]){
                    
                    input.inputPressed[input.keymap["MOUSE_"+mouseButton]] = true;
                    input.keybindings[input.keymap["MOUSE_"+mouseButton]].apply(this,[input,true]);
                }      
            }         
        }

        processing.mouseReleased = function(){
            var all = players;//.concat(enemies);
            for(var p in all){ 
                input = all[p].input; 
                if (input.keymap["MOUSE_"+mouseButton] != null && input.inputPressed[input.keymap["MOUSE_"+mouseButton]]){
                    input.inputPressed[input.keymap["MOUSE_"+mouseButton]] = false;
                    input.keybindings[input.keymap["MOUSE_"+mouseButton]].apply(this,[input,false]);
                }      
            }         
        }
        
        
        processing.keyPressed = function(){ 
            var all = players;//.concat(enemies);
            for(var p in all){              
                input = all[p].input;
                if (input.keymap[keyCode] != null && !input.inputPressed[input.keymap[keyCode]]){
                    input.inputPressed[input.keymap[keyCode]] = true;
                    input.keybindings[input.keymap[keyCode]].apply(this,[input,true]);
            }              
          }
               
        };
        
        processing.keyReleased = function(){ 
            var all = players;//.concat(enemies);
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


// send player score to the server
var sendScore = function(score,PlayerName) {
    //console.log(score);
    if (PlayerName == null) PlayerName = "AAA";
    $.ajax({
        url : "/send",
        cache: false,
        type: 'POST',
        data: score.toString() + ","  + PlayerName,
        success : function(result) {console.log("success")}
    });
    return false;            
};


var canvas = document.getElementById("lixo");
// attaching the sketchProc function to the canvas
var processingInstance = new Processing(canvas, sketchProc);


