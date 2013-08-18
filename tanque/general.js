
function General(){
	this.pos = {x:16*16, y:26*16};
	this.type = "general";
	this.generalSpriteSheet = null;
	this.explosionSpriteSheet = null;
	this.collisionInstance = null;
	this.isDead = false;

	this.setSpriteSheet = function(ss){
		this.generalSpriteSheet = ss;
	};

	this.setExplosionSpriteSheet = function(ss){
		this.explosionSpriteSheet = ss;
	};

	this.setCollision = function(col){
		this.collisionInstance = col;
		this.createCollider();
	};

	this.getCurrentSprite = function (){
		if (this.isDead){ 
			return this.generalSpriteSheet.getSprite("generalDead");
		} else {
			return this.generalSpriteSheet.getSprite("generalAlive");
		}
	};

	this.createCollider = function(){
		this.collisionInstance.createStaticCollider({obj:this, type:this.type, x:this.pos.x, y:this.pos.y}, {x:this.pos.x,y:this.pos.y, w:32,h:32}, 
                                        this.defaultCollision);
	};

	this.recreateFlag = function(){
		if (this.isDead){
			this.isDead=false;
			this.createCollider();		}
	}

	this.die = function(){
		this.isDead = true;
		allExplosions.push(new Explosion(this.pos.x,this.pos.y, explosionSpriteSheet, "Big"));

		this.collisionInstance.removeStaticCollider(this.pos.x, this.pos.y, this.type);
	}

	this.defaultCollision = function(info, other){
		var self = info.obj;
		if (other.type === "bullet"){
			self.die();
		}
	};




}