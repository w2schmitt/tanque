


//var allInputs = [];
function Input(){
    this.actions = {};
    this.keybindings = {};
    this.keymap = {};
    this.keyAttribute = {};
    this.value = this.keyAttribute; //alias for keyAttribute
    this.inputPressed = {};
    this.lastValue = {};
    
    this.setKeyAttributes = function(obj){
        //this.keyAttribute = obj;
        for(var attr in obj){
            var value = obj[attr];
            this.addKeyAttribue(attr,value);
        }
    }
     this.addKeyAttribue = function(attr,value){
        this.keyAttribute[attr] = value;
        this.setInputBooleanMap();
    }
    
    this.setActions = function(arg){
        this.actions = arg;
    }
    this.setBindingFunc = function(action,func){
        this.keybindings[action] = func;
    }
    
    this.setAllBindigFunc = function(bind){
        this.keybindings = bind;
    }
   
    this.setKey = function(key,action){
        this.keymap[key.charCodeAt(0)] = action;
    }
    this.setSpecialKey = function(key,action){
        this.keymap[key] = action;
    }
    this.getAction = function(action){
        return this.actions[action];
    }
    /*this.setInputBooleanMap = function(keypressedMap){
        this.inputPressed = keypressedMap;
    }*/
    
   this.setInputBooleanMap = function (){
        for (var i in this.actions) {
            this.inputPressed[this.actions[i]] = false;
        } 
    }
    
    this.setValue = function(attr,value){
        this.lastValue[attr] = this.value[attr];
        this.value[attr] = value;
    }
    
    //allInputs.push(this);
    this.clone=function(){
        var clonedInput = new Input();
         //copy actions:
        clonedInput.setActions(this.actions);
        //copy attributes
        clonedInput.setKeyAttributes(this.keyAttribute);
        //copy bindings functions:
        clonedInput.setAllBindigFunc(this.keybindings);
        return clonedInput;
        
    }
}

 