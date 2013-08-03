function Enum(){
    for (var i in arguments) {
        //this[arguments[i]] = i; //production
        this[arguments[i]] = arguments[i]; //debug
    }    
}



// the image containing the sprite sheet, 
// type of the sprites in image (from left to right, up to down),
// sprites x,y resolution
// number of sprites x and y in the image sheet
function createSprites(img, sprites, resX,resY, x, y){
    var sprite_array = {};
    var i=0,j=0;
    var temp=[];    
    
    for (var type in sprites) { temp.push(sprites[type]); }
    
    img.loadPixels();
    for (var i=0; i<x; i++){
        for (var j=0; j<y; j++){
             sprite_array[temp[i+j*x]] = img.get(i*resX, j*resY, resX, resY);        
        }
    }   
    
    return sprite_array;
}

// return obj containing attributes from obj1 and obj2
function merge_obj(obj1,obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
}

function sign(value){
    return (value<0)? -1 : 1;
}

function newArray(size, value){
    var a = new Array(size);
    for (var i = 0; i < a.length; i++) a[i] = value;
    return a;
}

function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}

function sameSign(a,b){
    return (a>0 && b>0) || (a<0 && b<0);
}

function gridAlign(value,optionalGridSize,optionalRoundingFunction){
    if (optionalRoundingFunction == null) optionalRoundingFunction = Math.floor;
    if (optionalGridSize == null ) optionalGridSize = 32;
    return optionalRoundingFunction(value/32)*32;
    
}

/*
Array.prototype.repeat= function(what, L){
    while(L) this[--L]= what;
    return this;
}
*/