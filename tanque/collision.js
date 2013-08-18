
function Collision(){
    this.staticColliders = [];
    this.dynamicColliders = [];
    
    this.createDynamicCollider = function(info,callback, offsetX, offsetY){
        offsetX = offsetX || 0;
        offsetY = offsetY || 0;
        info["offx"] = offsetX;
        info["offy"] = offsetY;
        this.dynamicColliders.push({"i":info, "func":callback});
    }
    
    this.createStaticCollider = function(info,rect,callback, offsetX, offsetY){
        offsetX = offsetX || 0;
        offsetY = offsetY || 0;
        info["offx"] = offsetX;
        info["offy"] = offsetY;
        this.staticColliders.push({"i":info, "r":rect, "func":callback});
    }

    this.clearStaticCollidersOfType = function(){
        for (var i in arguments){
            i = arguments[i];
            for (var j=this.staticColliders.length-1; j>=0; j--){
                if (this.staticColliders[j].i.type === i){
                     this.staticColliders.splice(j,1);
                }
            }           
        }
    }

    
    this.removeDynamicCollider = function( obj ){
        for (var i=0; i< this.dynamicColliders.length; i++)
            if (obj === this.dynamicColliders[i].i.obj){
                this.dynamicColliders.splice(i,1);
                break;
            }
    }
    
    // the position is the id that defines a Static Collider
    this.removeStaticCollider = function( x,y , type){
         for (var i=this.staticColliders.length-1; i>=0 ; i--){
            if (x === this.staticColliders[i].i.x && y === this.staticColliders[i].i.y && this.staticColliders[i].i.type === type){
                this.staticColliders.splice(i,1);  
                //console.log("found collider");
            }
         }
    };

    this.existsStaticCollider = function(x,y,type){
        for (var i=this.staticColliders.length-1; i>=0 ; i--){
            if (x === this.staticColliders[i].i.x && y === this.staticColliders[i].i.y && this.staticColliders[i].i.type === type){
                return true;
            }
         }

         return false;
    }

    // change the pairs [attr,value] of the collider
    this.modifyStaticCollider = function( x,y, type){
        var collider = null;
        //find collider
        for (var i=this.staticColliders.length-1; i>=0 ; i--){
            if (x === this.staticColliders[i].i.x && y === this.staticColliders[i].i.y && this.staticColliders[i].i.type === type){
                collider = this.staticColliders[i];
            }
        }
        // change attribute values
        if (collider !== null){
            for (var arg in arguments){
                if (arg<3) continue;
                var attr = arguments[arg][0];
                var value = arguments[arg][1];

                //console.log(x,y, attr, value);

                if (collider.i.hasAttribute(attr))
                    collider.i[attr] = value;
            }
        }
    };
    
    this.computeCollisions = function(){
        //collision between static and dynamic colliders
        for (var dc=this.dynamicColliders.length-1; dc>=0; dc-- ){
            var dcol = this.dynamicColliders[dc];
            for (var i=this.staticColliders.length-1; i>=0; i--) {
                scol = this.staticColliders[i];
                if (!scol) continue;
                dobj = dcol.i.obj;                
                rect = {x:(dobj.pos.x+dcol.i.offx), y:(dobj.pos.y+dcol.i.offy), w:dcol.i.w, h:dcol.i.h };
                srect = {x:(scol.r.x+scol.i.offx), y:(scol.r.y+scol.i.offy), w:scol.r.w, h:scol.r.h};
                if (this.overlap(rect,srect)){
                    dcol.func(dcol.i, scol.i);
                    scol.func(scol.i,dcol.i);
                }
            }
            
            //collision between dynamic collider
            for (var dc2=this.dynamicColliders.length-1; dc2>=0; dc2-- ){
                 dcol2 = this.dynamicColliders[dc2];
                 if (dcol2 === dcol) continue;
                 dobj = dcol.i.obj;
                 dobj2 = dcol2.i.obj;
                 rect = {x:(dobj.pos.x+dobj.currentSpeed.x + dcol.i.offx), y:(dobj.pos.y+dobj.currentSpeed.y + dcol.i.offy), w:dcol.i.w, h:dcol.i.h };
                 rect2 = {x:(dobj2.pos.x+dobj2.currentSpeed.x + dcol2.i.offx), y:(dobj2.pos.y+dobj2.currentSpeed.y + dcol2.i.offy), w:dcol2.i.w, h:dcol2.i.h };
                 if (this.overlap(rect,rect2)){
                    dcol.func(dcol.i,dcol2.i);
                    dcol2.func(dcol2.i,dcol.i);
                 }
                 
            }
            //console.log(col.info);
            //col.func(col.i);
        }
    }
    
    //CHECK OVERLAP RECTANGLES
    this.overlap = function(rectA, rectB){
        xoverlap = this.valueInRange(rectA.x, rectB.x, rectB.x + rectB.w ) ||
                   this.valueInRange(rectB.x, rectA.x, rectA.x + rectA.w);
        
        yoverlap = this.valueInRange(rectA.y, rectB.y, rectB.y + rectB.h) ||
                   this.valueInRange(rectB.y, rectA.y, rectA.y + rectA.h);
                   
        return xoverlap && yoverlap;
        
    }
    
    this.valueInRange = function(value,min,max){
        return (value >= min) && (value < max);
    }
    
    // function to help debug collision
    this.drawAllColliders = function(context){
        context.noFill();
        context.stroke(204, 102, 0);
        for (var dcol in this.dynamicColliders){
            dcol = this.dynamicColliders[dcol];
            context.rect(dcol.i.obj.pos.x + dcol.i.offx , dcol.i.obj.pos.y + dcol.i.offy, dcol.i.w, dcol.i.h );
        }
        
        context.stroke(102, 204, 0);
        
        for (var scol in this.staticColliders){
            scol = this.staticColliders[scol];
            context.rect(scol.r.x + scol.i.offx , scol.r.y + scol.i.offy, scol.r.w, scol.r.h );
        }
        
    }
    
    /*
    this.tilesWithCollider = [];
    this.collider = {x:0,y:0,sizex:0,sizey:0};
    
    this.createMapColliders = function(map){
        for (var i in map){
            mapline = map[i];
            for (j in mapline){
                
            }
            
        }
    }
    this.checkCollision = function (x,y){
        
    }
    */
}