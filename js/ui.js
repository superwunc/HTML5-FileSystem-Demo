/**
    @fileOverview
    App ui compontent
    @author wunc <superwunc@gmail.com>
 */


(function () {
    
    var ui = {};
    ui.Dialog = function (element, option) {
        this.domNode = element;
        var self = this;
        bind(this.domNode, "click", function (event) {
            var srcElement = event.srcElement;
            if (hasClass(srcElement,"close-btn")) {
                self.hide(event);
            }
        });
    }
    
    ui.Dialog.prototype.hide = function (event) {
        this.domNode.style.display = "none";
    }
    
    ui.Dialog.prototype.show = function (pos) {
        var domNode = this.domNode;
        domNode.style.display = "block";
        domNode.style.position = "absolute";
        if (!pos) {
            domNode.style.left = ((window.innerWidth / 2) - 
                                    (domNode.clientWidth / 2)) + "px";
            domNode.style.top = ((window.innerHeight / 2) - 
                                    (domNode.clientHeight / 2)) + "px";
        }
        else {
            if (pos.top) {
                domNode.style.top = (pos.top) + "px";   
            }
            if (pos.left) {
                domNode.style.left = (pos.left) + "px";   
            }
            if (pos.right) {
                domNode.style.right = (pos.right) + "px";   
            }
            if (pos.bottom) {
                domNode.style.bottom = (pos.bottom) + "px";   
            }
        }
    }
    
    ui.PopupMenu = function (element) {
        this.domNode = element;
        this._events = {};
        //popupMenuMap[element.getAttribute("id")] = this;
        var self = this;
        var hideCallback = function (event) {
            self.domNode.style.display = "none";
        }
        bind(document.body,"mousedown",hideCallback);
        bind(this.domNode,"mouseover",function (event) {
            unbind(document.body,"mousedown",hideCallback);
        });
        bind(this.domNode,"mouseout",function (event) {
            bind(document.body,"mousedown",hideCallback);
        });
        bind(this.domNode,"click",function (event) {
            var srcElement = event.srcElement;
            var menuNode = srcElement;
            self.domNode.style.display = "none";
            while(!hasClass(menuNode,"popup-menu-item")) {
                menuNode = menuNode.parentNode;
            }
            if (menuNode != null && !menuNode.getAttribute("disabled")) {          
                if (self._events["itemClick"]) {
                    self._events["itemClick"](event, menuNode);
                }
            }
            
        });
    }
    
    ui.PopupMenu.prototype.bind = function (eventName, callback) {
        this._events[eventName] = callback;
    }
    
    
    ui.PopupMenu.prototype.setDisabled = function (index, bool) {
        var menuNode = this.domNode;
        var menuItemNodes =  query(menuNode, ".popup-menu-item");
        if (bool == true) {
            menuItemNodes[index].setAttribute("disabled", "disabled");
        }
        else {
            menuItemNodes[index].removeAttribute("disabled");
        }
        
    }
    
    ui.PopupMenu.prototype.show = function (pos) {
        var menuNode = this.domNode;
        menuNode.style.display = "block";
        var menuHeight = menuNode.clientHeight;
        
        if ((menuHeight + pos.y) > window.innerHeight) {
            if (pos.y > menuHeight) {
                pos.y = pos.y - menuHeight + (pos.offsetY ? pos.offsetY : 0);
            }
        }
        menuNode.style.position = "absolute";
        menuNode.style.left = (pos.x) + "px";
        menuNode.style.top = (pos.y) + "px";
    }
    
    ui.PopupMenu.prototype.hide = function () {
        this.domNode.style.display = "none";
    }
    
    
    
    
    
    
    this.ui = ui;
    
    
})();
