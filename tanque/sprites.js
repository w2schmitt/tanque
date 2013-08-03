
function SpriteSheet(img){
    this.sprite_array = {};    
    this.sheet = img;
    this.initialized = false;
    this.spriteNames = []; 
    this.spriteReferences = {}; 
    this.animations = {};
    this.contextalizedAnimations = {};
    
    this.context = 0;
    this.createContext = function(){
        return this.context++;  
    }
    
    this.createSprites = function ( resX, resY,  x, y,optionalOffsetX,optionalOffsetY){ 
        optionalOffsetX = optionalOffsetX | 0;
        optionalOffsetY = optionalOffsetY | 0;
        if (!this.loaded()) return false;        
        var sprites_arr = this.getSpriteArray(resX,resY);
        this.sheet.loadPixels();        // wut? --> tem que chamar isso pro get funfar... ahhhn
        for (var i=0; i<x; i++){
            var spriteLine = [];
            for (var j=0; j<y; j++){                 
                spriteLine.push( this.sheet.get(optionalOffsetX + i*resX, optionalOffsetY + j*resY, resX, resY));
            }
            sprites_arr.push(spriteLine);
        }           
        this.initialized = true;
    };
    
    // get an array of sprites that has the specified resolution
    this.getSpriteArray = function(resX, resY){
        if (this.sprite_array.hasOwnProperty([resX,resY]))
            return this.sprite_array[[resX,resY]];              
        this.sprite_array[[resX,resY]] = [];
        return this.sprite_array[[resX,resY]];
    }

    // rect -> [x,y,w,h]  -> Agora é um rect de verdade   (w*h == names.length)
    // names -> enum("none", "brick", ...)
    this.setRectSprites = function(rect,  resX, resY, names){  
        var r = {x:rect[0], y:rect[1], w:rect[2], h:rect[3]};        
        if (names.length != r.w*r.h) {
            console.log("Name of sprites and Rect do not match");
            return false;        
        }      
        for (var i=r.x; i<(r.x+r.w); i++){
            for (var j=r.y; j<(r.y+r.h); j++){
                this.setSprite(i,j, names[(i-r.x) + (j-r.y)*r.w], resX, resY);
            }
        }
    };
    
    this.loaded = function(){
        return this.sheet.loaded;
    };
    
    this.setAnimation = function(spriteNames,animationName,optionalFps,optionalRepeat){
        if (optionalRepeat == null){optionalRepeat = true}
        //optionalFps will never be used LOL
        if (this.animations[animationName] != null) return false;
        this.animations[animationName] = new Animation(optionalFps,optionalRepeat);
        for (var spriteName in spriteNames ){
            spriteName = spriteNames[spriteName];
            this.animations[animationName].addFrame (this.spriteReferences[spriteName]);
        }
        
    };
    

    this.setSprite = function(x,y,name, resX, resY){
        var sprites_arr = this.getSpriteArray(resX,resY);
        if (sprites_arr){
            this.spriteNames.push(name);
            this.spriteReferences[name] = sprites_arr[x][y]; 
        } else console.log("cannot found sprites with resolution: ",resX, resY);
    };
    
    this.getSprite = function(name,optionalContext){
        //var sprite =  this.spriteReferences[name];
        //if (sprite != null ) return sprite;
        return (this.spriteReferences[name] || this.getAnimation(name,optionalContext).getSprite());
          
    };
    
    
    this.getAnimation = function(name,optionalContext){
        
        if (optionalContext) {
            if (this.contextalizedAnimations[name] == null){
                this.contextalizedAnimations[name] = {};
            }
            if (this.contextalizedAnimations[name][optionalContext] == null){ 
                //copy animation to the context:
                this.contextalizedAnimations[name][optionalContext] = this.animations[name].clone();
                
            }
            
            return this.contextalizedAnimations[name][optionalContext] ;
            
        }else{
             return this.animations[name];
        }
    };
    
    //nao precisa mais dessa funcao de update <--- magic
    /*this.update = function(){
        
        for (var i in this.animations){
            this.animations[i].update(); 
        }
    };*/
}

function Animation(optionalFps,optionalRepeat){
    
    this.currentFrame = 0;
    this.currentSprite = null;
    this.frames = [];
    this.animationInterval = null;
    this.fps  = 30;
    if (optionalFps){
        this.fps = optionalFps;
    }
    this.repeat = true;
    if (optionalRepeat != null){
        this.repeat = optionalRepeat;
    }
    
    this.sprites = [];
    this.update = function(){ 
         this.currentSprite = this.frames[this.currentFrame];
    };
    
    this.addFrame = function(frame){
        this.frames.push(frame); 
        this.update();
    };
    
    this.getSprite = function(){
        return this.currentSprite;
    };
    
    this.stop = function(){
        if (this.animationInterval != null){
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
    };
    this.nextFrame = function(){
        if (this.frames.length > 0){
            this.currentFrame += 1;
           
            // mudei aqui
            if (this.currentFrame == this.frames.length & !this.repeat){ 
                this.stop();
                this.currentFrame = null;
            } else {               
                this.currentFrame %= this.frames.length;
            }
        }
       this.update();
        
    };
    this.isStopped = function(){
        return (this.animationInterval == null);
        
    }
    this.start = function(){
        this.stop();
        this.animationInterval = setInterval(
                //loucura pra nao perder a referencia do this
                (function(self) {         //Self-executing func which takes 'this' as self
                     return function() {   //Return a function in the context of 'self'
                         self.nextFrame(); //Thing you wanted to run as non-window 'this'
                     }
                 })(this),
                 1000.0/this.fps 
            )
        this.nextFrame();
    };
    this.continue = function(){
        if (this.animationInterval == null){
            this.start(); 
        } 
    }
    this.clone = function(){
        var newAnimation = new Animation(this.fps,this.repeat);
        //copy all shit:
        //newAnimation.currentFrame = this.currentFrame;
        newAnimation.currentSprite = this.currentSprite;
        //newAnimation.frames = this.frames ;
        newAnimation.frames = [];
        for (var i in this.frames){
            newAnimation.frames.push(this.frames[i]);
        }
        //newAnimation.fps = this.fps;
        //newAnimation.repeat =  this.repeat;
        newAnimation.update();
        return newAnimation;
        
    }
    this.start();
    
}

