/**
    @fileOverview
    File Editor (txt and image)
    @author wunc <superwunc@gmail.com>
 */

(function() {
    
    
    if (!window.view) {
        window.view = {};
    }
    
    
    var editor = {};
    var currentPath = null;
    var txtEditorDialog = null;
    var txtEditor = null;
    var txtTitle = null;
    var imageEditorDialog = null;
    var imageEditor = null;
    var imageTitle = null;
    var saveBtn = null;
    
    function init() {
        txtEditorDialog = new ui.Dialog(byId("txt-editor-dialog"));
        imageEditorDialog = new ui.Dialog(byId("image-editor-dialog"));
        txtEditor = byId("txt-editor");
        imageEditor = byId("image-editor");
        saveBtn = byId("save");
        txtTitle = byId("txt-title");
        imageTitle = byId("image-title");
        bindEvent();
    }
    
    function bindEvent() {
        bind(saveBtn, "click", function (event) {
            saveFile();
        });
       
        
    }
    
    function showTxt(path, file, content) {
        currentPath = path;
        txtEditor.value = "";
        txtEditor.value = content;
        txtTitle.innerHTML = "<div>" + file.name + "</div>" 
        + "<div>" + formatDate(file.lastModifiedDate) + "</div>" ;
        txtEditorDialog.show();
    }
    
    function showImage(path, url, file) {
        currentPath = path;
        imageTitle.innerHTML = "<div>" + file.name + "</div>" ;
        imageEditor.src = url;
        imageEditorDialog.show();
    }
    
    function saveFile() {
        if (currentPath != null) {
            fs.writeFile(currentPath, txtEditor.value, {
                "success": function () {
                    txtEditorDialog.hide();
                }
            });
        }
    }
    
    editor["init"] = init;
    editor["showTxt"] = showTxt;
    editor["showImage"] = showImage;
    
    window.view.editor = editor;

})();
