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
    
    this.ui = ui;
    
    
})();
