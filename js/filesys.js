/**
    @fileOverview
    App file explorer 
    @author wunc <superwunc@gmail.com>
 */



(function() {
    
    const PREFIX_NEW_FILE_TITLE = "新建文本文档";
    const PREFIX_NEW_FOLDER_TITLE = "新建文件夹";
    
    if (!window.view) {
        window.view = {};
    }

    var readBtn = null;
    var writeBtn = null;
    var addFileBtn = null;
    var addFolderBtn = null;
    var deleteFileBtn = null;
    var downloadFileBtn = null;
    var downloadTarget = null;
    var uploadFileBtn = null;
    var selectFile = null;
    var dirName = null;
    var fileSystemTree = null;
    var fileSystemContent = null;
    var fileSystemNav = null;
    var contextMenu = null;
    var titleRenameInput = null;
    
    
    var currentSelectedEntry = null;
    var currentCopyEntry = null;
    var currentCutEntry = null;
    var currentEntrys = [];
    var currentPath = null;

    function init() {
        readBtn = byId("read-btn");
        writeBtn = byId("write-btn");
        addFileBtn = byId("add-file");
        addFolderBtn = byId("add-folder");
        deleteFileBtn = byId("delete-file");
        downloadFileBtn = byId("download-file");
        uploadFileBtn = byId("upload-file");
        selectFile = byId("select-file");
        dirName = byId("dir-name");
        fileSystemTree = byId("file-system");
        fileSystemContent = byId("file-system-content");
        fileSystemNav = byId("file-system-nav");
        downloadTarget = byId("download-target");
        contextMenu = new ui.PopupMenu(byId("fun-context-menu"));
        titleRenameInput = document.createElement("input");
        titleRenameInput.style.width = "100%";
        titleRenameInput.setAttribute("maxlength", 20);
        bindEvent();
        showDir("/");
    }

    function bindEvent() {
        bind(fileSystemContent, "dblclick", function(event) {
            var srcElement = event.srcElement;
            if(isClickFolder(srcElement) == true) {
                ondblclickFolder(findFolderNode(srcElement));
            }
            else if(isClickFile(srcElement) == true) {
                ondblclickFile(findFileNode(srcElement));
            }
        });
        bind(fileSystemContent, "click", function(event) {
            var srcElement = event.srcElement;
            if(isClickFolder(srcElement) == true) {
                onclickFolder(findFolderNode(srcElement));
            }
            else if(isClickFile(srcElement) == true) {
                onclickFile(findFileNode(srcElement));
            }
        });
        bind(fileSystemNav, "click", function(event) {
            var srcElement = event.srcElement;
            if(isClickNavFolder(srcElement) == true) {
                onclickNavFolder(findNavFolderNode(srcElement))
            }
        });
        bind(addFileBtn, "click", function(event) {
            newFile();
        });
        bind(addFolderBtn, "click", function(event) {
            newDir();
        })
        bind(deleteFileBtn, "click", function(event) {
            deleteFile();
        });
        bind(downloadFileBtn, "click", function (event) {
            downloadFile();
        });
        bind(uploadFileBtn, "change", function (event) {
            uploadFile(uploadFileBtn.files);
        });
        
        bind(fileSystemContent,"contextmenu",function (event) {
            onRightClickHandler(event);
        });
        
        contextMenu.bind("itemClick", function (event) {
            var srcElement = event.srcElement;
            var dataCommand = srcElement.getAttribute("data-command");
            executeCommand(dataCommand);
        });
        
        bind(titleRenameInput, "blur", function (event) {
            rename();
        });
        bind(titleRenameInput, "keydown", function (event) {
           if (event.keyCode == 13) {
               titleRenameInput.blur();
           }
        });
    }

    function ondblclickFolder(ele) {
        var path = ele.getAttribute("data-path");
        console.log("dblclick");
        showDir(path);
    }
    
    function ondblclickFile(ele) {
        var path = ele.getAttribute("data-path");
        console.log("ondblclickFile");
        showFile(path);
    }
    

    
    /**
        @description 右键菜单事件处理
     */
    function onRightClickHandler(event) {
        event.preventDefault();
        var srcElement = event.srcElement;
        var pos = {};
        pos.x = event.clientX;
        pos.y = event.clientY;
        if(isClickFolder(srcElement) == true) {
            onclickFolder(findFolderNode(srcElement));
            contextMenu.setDisabled(0, false);
            contextMenu.setDisabled(1, false);
            contextMenu.setDisabled(2, true);
            contextMenu.setDisabled(3, true);
            contextMenu.setDisabled(4, false);
        }
        else if(isClickFile(srcElement) == true) {
            onclickFile(findFileNode(srcElement));
            contextMenu.setDisabled(0, false);
            contextMenu.setDisabled(1, false);
            contextMenu.setDisabled(2, true);
            contextMenu.setDisabled(3, true);
            contextMenu.setDisabled(4, false);
        }
        else {
            if ((currentCopyEntry != null) || (currentCutEntry != null)) {
                contextMenu.setDisabled(0, true);
                contextMenu.setDisabled(1, true);
                contextMenu.setDisabled(2, false);
                contextMenu.setDisabled(4, true);
            }
            else {
               contextMenu.setDisabled(0, true);
               contextMenu.setDisabled(1, true);
               contextMenu.setDisabled(2, true);
               contextMenu.setDisabled(3, true); 
               contextMenu.setDisabled(4, true);
            }
        }
        contextMenu.show(pos);
    }
    
    function removeSelectedEntryStyle() {
        if (currentSelectedEntry != null) {
            if (currentSelectedEntry.isFile == true) {
                byId("file-" 
                + currentSelectedEntry.fullPath).className = "file";
            }
            else {
                byId("folder-" 
                + currentSelectedEntry.fullPath).className = "folder";
            }
        }
    }

    function onclickFolder(ele) {
        var path = ele.getAttribute("data-path");
        if ((currentSelectedEntry != null) 
            && (currentSelectedEntry.fullPath == path)) {
            return;
        }
        ele.className = "folder folder-selected";
        fs.getDir(path, {
            "success": function (dir) {
                removeSelectedEntryStyle();
                currentSelectedEntry = dir;
                console.log("onclickFolder", currentSelectedEntry);
            }
        })
    }

    function onclickFile(ele) {
        var path = ele.getAttribute("data-path");
        if ((currentSelectedEntry != null) 
            && (currentSelectedEntry.fullPath == path)) {
            return;
        }
        ele.className = "file file-selected";
        fs.getFile(path, {
            "success": function (file) {
                removeSelectedEntryStyle();
                currentSelectedEntry = file;
             //   console.log("onclickFile", currentSelectedEntry);
            }
        });
    }

    function onclickNavFolder(ele) {
        var path = ele.getAttribute("data-path");
        if(path == currentPath) {
            return;
        }
        showDir(path);
    }

    function newFile() {
        var path = currentPath;
        var fileName = getNewTitle("file", 
                        PREFIX_NEW_FILE_TITLE, currentEntrys) + ".txt";
        fs.createNewFile(path + "/" + fileName, {
            "success" : function(file) {
                addFileNode(file);
                editEntryName(file);
                addEntrys([file]);
            }
        });
    }
    
    function executeCommand(command) {
        switch (command) {
        case "cut": {
            currentCutEntry = currentSelectedEntry;
            break;
        }
        case "copy": {
            currentCopyEntry = currentSelectedEntry;
            break;
        }
        case "paste": {
            if (currentCutEntry != null) {
                 fs.findSameNameEntry(currentCutEntry, currentPath, {
                    "type": (currentCutEntry.isFile == true) ? "file" : "folder", 
                    "found": function (fromEntry, toEntry, sameEntry) {
                         if (fromEntry.fullPath == sameEntry.fullPath) {
                             currentCutEntry = null;
                             return;
                         }
                         var result = 
                         window.confirm("确认 要替换同名文件 \"" + fromEntry.name + "\"");
                         if (result == false) {
                            return ;
                         }
                         fs.replace(fromEntry, toEntry, sameEntry,{
                             "type": "cut",
                             "success": function (entry) {
                                 currentCutEntry = null;
                             }
                         }); 
                    },
                    "nofound": function (fromEntry, toEntry) {
                        fs.move(fromEntry, toEntry, {
                            "success": function (entry) {
                                if (entry.isFile == true) {
                                    addFileNode(entry);
                                }
                                else {
                                    addFolderNode(entry);
                                }
                                
                                currentCutEntry = null;
                            }
                        });
                    }
                });
                
            }
            else if (currentCopyEntry != null) {
                fs.findSameNameEntry(currentCopyEntry, currentPath, {
                    "type": (currentCopyEntry.isFile == true) ? "file" : "folder", 
                    "found": function (fromEntry, toEntry, sameEntry) {
                         if (fromEntry.fullPath == sameEntry.fullPath) {
                             currentCutEntry = null;
                             return;
                         }
                         var result = 
                         window.confirm("确认 要替换同名文件 \"" + fromEntry.name + "\"");
                         if (result == false) {
                            return ;
                         }
                         fs.replace(fromEntry, toEntry, sameEntry,{
                             "type": "copy",
                             "success": function (entry) {
                                 currentCopyEntry = null;
                             }
                         }); 
                         
                    },
                    "nofound": function (fromEntry, toEntry) {
                        fs.copy(fromEntry, toEntry, {
                            "success": function (entry) {
                                if (entry.isFile == true) {
                                    addFileNode(entry);
                                }
                                else {
                                    addFolderNode(entry);
                                }
                                currentCopyEntry = null;
                            }
                        });
                    }
                });
            }
            break;
        }
        case "cancel" : {
            currentCutEntry = null;
            currentCopyEntry = null;
            break;
        }
        case "rename" : {
            editEntryName(currentSelectedEntry);
            break;
        }
        }
    }

    function deleteFile() {
        if(currentSelectedEntry == null) {
            alert("请选择文件夹或者文件");
            return;
        }
        else {
            var result = 
            window.confirm("确认 要删除  \"" + currentSelectedEntry.name + "\"");
            if (result == false) {
                return ;
            }
        }
        var path = currentSelectedEntry.fullPath;
        if (currentSelectedEntry.isFile == true) {
            fs.deleteFile(path, {
                "success" : function(file) {
                    removeEntry(file);
                    currentSelectedEntry = null;
                    var domId = "file-" + path;
                    var domNode = document.getElementById(domId);
                    domNode.parentNode.removeChild(domNode);
                }
            });
        }
        else {
            fs.deleteDir(path, {
                "success" : function(dir) {
                    removeEntry(dir);
                    currentSelectedEntry = null;
                    var domId = "folder-" + path;
                    var domNode = document.getElementById(domId);
                    domNode.parentNode.removeChild(domNode);
                }
            });
        }

    }
    
    function downloadFile() {
        if((currentSelectedEntry == null) 
                    || (currentSelectedEntry.isFile == false)) {
            alert("请选择文件");
            return;
        }
        
        // copy form zip.js 
        var clickEvent = document.createEvent("MouseEvent");    
        clickEvent.initMouseEvent("click", true, true, window, 
                            0, 0, 0, 0, 0, false, false, false, false, 0, null);
        downloadTarget.href = currentSelectedEntry.toURL();
        downloadTarget.download = currentSelectedEntry.name;
        downloadTarget.dispatchEvent(clickEvent);
        downloadTarget.href = "";
        downloadTarget.download = "";
       
    }
    
    function uploadFile(files) {
       var path = currentPath;
       
       for (var i = 0, l = files.length; i < l; i++) {
           var file = files[i];
           var fileName = file.name;
           fs.readFile(file, {
               "mode": "arraybuffer",
               "success": function (f , result) {
                   fs.writeFile(path + "/" + fileName , result, {
                       "flag": fs.CREATE_IF_NOT_FOUND,
                       "success": function () {
                           addFileNode(path + "/" + fileName, fileName);
                       }
                   })
               }
           })

       }
    }

    function newDir() {
        var path = currentPath;
        var folderName = getNewTitle("folder", PREFIX_NEW_FOLDER_TITLE, currentEntrys);
        fs.createNewDir(path + "/" + folderName, {
            "success" : function(dir) {
                addFolderNode(dir);
                editEntryName(dir);
                addEntrys([dir]);
            }
        });
    }
    
    function rename() {
        var newName = titleRenameInput.value;
        if (currentSelectedEntry.name == newName) {
            return;
        }
        
        var nodeNode = null;
        
        var titleNode = titleRenameInput.parentNode;
        if (currentSelectedEntry.isFile == true) {
            nodeNode = findFileNode(titleNode);
        }
        else {
            nodeNode = findFolderNode(titleNode);
        }
        
        var newNameTextNode = document.createTextNode(newName);
        fs.rename(currentSelectedEntry, newName, {
            "success": function (entry) {
                window.setTimeout(function () {
                    currentSelectedEntry = entry;
                    if (entry.isFile) {
                        nodeNode.id = "file-" + entry.fullPath;
                    }
                    else {
                        nodeNode.id = "folder-" + entry.fullPath;
                    }
                    nodeNode.setAttribute("data-path", entry.fullPath);
                    
                    titleNode.replaceChild(newNameTextNode, titleRenameInput);
                }, 30)
                
            }
        })
    }

    function isClickFolder(ele) {
        while(ele) {
            if(hasClass(ele, "folder")) {
                return true;
            }
            ele = ele.parentNode;
        }
        return false;
    }

    function isClickNavFolder(ele) {
        while(ele) {
            if(hasClass(ele, "nav-folder")) {
                return true;
            }
            ele = ele.parentNode;
        }
        return false;
    }

    function findFolderNode(ele) {
        while(ele) {
            if(hasClass(ele, "folder")) {
                return ele;
            }
            ele = ele.parentNode;
        }
        return null;
    }

    function findNavFolderNode(ele) {
        while(ele) {
            if(hasClass(ele, "nav-folder")) {
                return ele;
            }
            ele = ele.parentNode;
        }
        return null;
    }

    function isClickFile(ele) {
        while(ele) {
            if(hasClass(ele, "file")) {
                return true;
            }
            ele = ele.parentNode;
        }
        return false;
    }

    function findFileNode(ele) {
        while(ele) {
            if(hasClass(ele, "file")) {
                return ele;
            }
            ele = ele.parentNode;
        }
        return null;
    }
    
   
    function showDir(path) {
        fs.getDir(path, {
            "success": function (dir) {
                clearFSContent();
                updateFSNavFolder(dir);
                fs.listFiles(dir, {
                   "success": function (entryArray) {
                        addEntrys(entryArray);
                        for(var i = 0, l = entryArray.length; i < l; i++) {
                            var entry = entryArray.item(i);
                            if(entry.isFile == true) {
                                addFileNode(entry);
                            }
                            else {
                                addFolderNode(entry);
                            }
                        }
                    } 
                });
            }
        });        
    }
    
    function showFile(path) {
        if (/.?\.jpg$/.test(path) || /.?\.png$/.test(path)) {
            fs.getFile(path, {
                "success": function (fileEntry) {
                    window.view.editor.showImage(path, fileEntry.toURL(), fileEntry);
                }
            })
        }
        else {
            fs.readFile(path, {
                "success": function (file, result) {
                    window.view.editor.showTxt(path, file, result);
                }
            })
            
        }
        
        
    }
    
    function addEntrys(entrys) {
        for (var i = 0 , l = entrys.length; i < l; i++) {
            currentEntrys.push(entrys[i]);
        }
    }
    
    function removeEntry(entry) {
        var index = null;
        for (var i = 0 , l = currentEntrys.length; i < l; i++) {
            if (entry.fullPath == currentEntrys[i].fullPath) {
                index = i;
                break;
            }
        }
        currentEntrys.splice(index, 1);
        
    }
     
    function updateFSNavFolder(dir) {
        if(currentPath == dir.fullPath) {
            return;
        }
        fileSystemNav.innerHTML = "";
        currentPath = dir.fullPath;
        var paths = dir.fullPath.split("/");
        var tempPath = "";
        for(var i = 0, l = (paths.length); i < l; i++) {
            if(i == (l - 1) && paths[i] == "") {
                return;
            }
            var path = tempPath + ((paths[i] == "") ? "/" : paths[i]);
            tempPath = path;
            var name = paths[i];
            fileSystemNav.appendChild(buildFolderNavNode(path, name));
        }
    }
    
    
     function getNewTitle(type, prefix, entrys) {
        //NewNoteIndex++;
        var titleIndexMap = {};
        var count = entrys.length;
        var title = null;
        var index = null;
        var entry = null;
        var newTitleIndex = 1;
        for (var i = 0; i < count; i++) {
            entry = entrys[i];
            if ((type == "file") && (entry.isFile == false)) {
                continue;
            }
            if ((type == "folder") && (entry.isFile == true)) {
                continue;
            }
            title = entry.name;
            if (title.indexOf(prefix) == 0) {
                index = parseInt(title.substring(
                    prefix.length, title.length));
                index = parseInt(index, 10);
                if (!isNaN(index)) {
                    titleIndexMap[index] = true;
                }
            }
        }
        while (titleIndexMap[newTitleIndex] == true) {
            newTitleIndex++;
        }
        return prefix + newTitleIndex;
    }

    function clearFSContent() {
        currentEntrys = [];
        currentSelectedEntry = null;
        console.log("clearFSContent", currentSelectedEntry);
        fileSystemContent.innerHTML = "";
    }


    function addFileNode(/*fileEntry or path ,name*/) {
        var path = null;
        var name = null;
        if (arguments.length == 1) {
            path = arguments[0].fullPath;
            name = arguments[0].name;
        }
        else if (arguments.length == 2) {
            path = arguments[0];
            name = arguments[1];
        }
        fileSystemContent.appendChild(buildFileNode(path, name));
    }

    function addFolderNode(dirEntry) {
        fileSystemContent.appendChild(buildFolderNode(dirEntry));
    }

    function buildFileNode(path, name) {
        var node = document.createElement("div");
        var html = "";
        node.id = "file-" + path;
        node.className = "file";
        node.setAttribute("data-path", path);
        html += "<div class=\"file-icon\"></div>";
        html += "<div class=\"file-name\">" + name + "</div>";
        node.innerHTML = html;
        return node;
    }
    
    function getFileNode(fileEntry) {
        return byId("file-" + fileEntry.fullPath);
    }

    function buildFolderNode(dirEntry) {
        var node = document.createElement("div");
        var html = "";
        node.id = "folder-" + dirEntry.fullPath;
        node.className = "folder";
        node.setAttribute("data-path", dirEntry.fullPath);
        html += "<div class=\"folder-icon\"></div>";
        html += "<div class=\"folder-name\">" + dirEntry.name + "</div>";
        node.innerHTML = html;
        return node;
    }
    
    function getFolderNode(folderEntry) {
        return byId("folder-" + folderEntry.fullPath);
    }

    function buildFolderNavNode(fullPath, name) {
        var node = document.createElement("div");
        var html = "";
        node.className = "nav-folder";
        node.setAttribute("data-path", fullPath);
        html += (name == "") ? "/" : "/" + name;

        node.innerHTML = html;
        return node;
    }
    
    function editEntryName(entry) {
        var node = null;
        var titleNode = null;
        if (entry.isFile == true) {
            node = getFileNode(entry);
            titleNode = query(node, ".file-name")[0];
        }
        else {
            node = getFolderNode(entry);
            titleNode = query(node, ".folder-name")[0];
        }
        titleRenameInput.value = titleNode.firstChild.nodeValue;
        titleNode.replaceChild(titleRenameInput, 
            titleNode.firstChild);
        titleRenameInput.select();
    }
    var filesys = {};
    filesys["init"] = init;
    window.view.filesys = filesys;
    
    
    
    
})();





