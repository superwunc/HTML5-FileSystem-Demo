/**
    @fileOverview
    File Editor (txt and image)
    @author wunc <superwunc@gmail.com>
 */

(function() {
    
    
    if (!window.view) {
        window.view = {};
    }
    
    
    var conflict = {};
    
    var callback = {};
    
    var fileCopyConflictDialog = null;
    var fileCutConflictDialog = null;
    var folderCopyConflictDialog = null;
    var folderCutConflictDialog = null;
    
    function init() {
        fileCopyConflictDialog = 
                new ui.Dialog(byId("file-copy-conflict-dialog"));
        fileCutConflictDialog = 
                new ui.Dialog(byId("file-cut-conflict-dialog"));
        folderCopyConflictDialog =  
                new ui.Dialog(byId("folder-copy-conflict-dialog"));
        folderCutConflictDialog = 
                new ui.Dialog(byId("folder-cut-conflict-dialog"));  
                
        bindEvent();
    }
    
    
    function bindEvent() {
        bind(fileCopyConflictDialog.domNode, "click" , function (event) {
             var command = getCommand(event.srcElement, fileCopyConflictDialog);
             if (command && callback[command]) {
                 callback[command](fileCopyConflictDialog);
             }    
        });
        bind(fileCutConflictDialog.domNode, "click" , function (event) {
             var command = getCommand(event.srcElement, fileCutConflictDialog);
             if (command && callback[command]) {
                 callback[command](fileCutConflictDialog);
             } 
        });
        bind(folderCopyConflictDialog.domNode, "click" , function (event) {
             var command = getCommand(event.srcElement, folderCopyConflictDialog);
             if (command && callback[command]) {
                 callback[command](folderCopyConflictDialog);
             } 
        });
        
        bind(folderCutConflictDialog.domNode, "click" , function (event) {
             var command = getCommand(event.srcElement, folderCutConflictDialog);
             if (command && callback[command]) {
                 callback[command](folderCutConflictDialog);
             } 
        });
        
        
    }
    
    function getCommand(srcElement, rootElement) {
        while(srcElement != rootElement) {
             if (srcElement.getAttribute("data-command")) {
                 return srcElement.getAttribute("data-command");
             }
            srcElement = srcElement.parentNode;
        }
        return null;
    } 
   
    
    
    function show(type, option) {
        callback = option;
        switch (type) {
        case "file-copy-conflict": {
            fileCopyConflictDialog.show();
            break;
        }
        case "file-cut-conflict": {
            fileCutConflictDialog.show();
            break;
        }
        case "folder-copy-conflict": {
            folderCopyConflictDialog.show();
            break;
        }
        case "folder-cut-conflict": {
            folderCutConflictDialog.show();
            break;
        }         
        }
    }
   
    
    conflict["init"] = init;
    conflict["show"] = show;
     
    window.view.conflict = conflict;

})();
