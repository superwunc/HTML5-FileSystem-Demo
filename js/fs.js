/**
    @fileOverview
    HTML5 FileSystem API 
    @author wunc <superwunc@gmail.com>
 */





(function () {
    var fs = {};
    
    var CREATE_IF_NOT_FOUND = {create: true, exclusive: false};
    var NO_CREATE = {create: false};
    
    var reqFS = window.webkitRequestFileSystem 
    || window.mozRequestFileSystem 
    || window.requestFileSystem  ;
    var BlobBuilder =  window.BlobBuilder 
               || window.MozBlobBuilder 
               || window.WebKitBlobBuilder 
               || window.OBlobBuilder 
               || window.msBlobBuilder;       
    fs.config = {
        "size": 4 * 1024 * 1024 * 1024,
        "type": window.TEMPORARY
    };
    /*
    function open(path, mode, option) {
        reqFS(fs.config.type, fs.config.size , function (fileSystem) {
             fileSystem.root.getFile(path)
        });
    }
    */
   
   function executeSuccessCallback(option) {
       if (option && option["success"]) {
           var param = [];
           for (var i = 1, l = arguments.length; i < l; i++) {
                param.push(arguments[i]);
           }
           option["success"].apply(window, param);
       }
   }
   
   
    function errorHandler(e) {
        var msg = "";
        switch (e.code) {
            case FileError.QUOTA_EXCEEDED_ERR:
                msg = 'QUOTA_EXCEEDED_ERR';
                break;
            case FileError.NOT_FOUND_ERR:
                msg = 'NOT_FOUND_ERR';
                break;
            case FileError.SECURITY_ERR:
                msg = 'SECURITY_ERR';
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                msg = 'INVALID_MODIFICATION_ERR';
                break;
            case FileError.INVALID_STATE_ERR:
                msg = 'INVALID_STATE_ERR';
                break;
            default:
                msg = 'Unknown Error';
                break;
        };

        console.log('Error: ' + msg);
    }

   
   function executeErrorCallback(option, args) {
       if (option && option["error"]) {
           var param = [];
           for (var i = 1, l = arguments.length; i < l; i++) {
                param.push(arguments[i]);
           }
           option["error"].apply(window, param);
       }
       errorHandler(args);
       console.log(args);
   }
   
   function createNewFile(path, option) {
       reqFS(fs.config.type, fs.config.size , 
           function (fileSystem) {
               fileSystem.root.getFile(path, 
                  CREATE_IF_NOT_FOUND,
                  function (file) {
                      executeSuccessCallback(option, file)
                  },
                  function (error) {
                      executeErrorCallback(option, error);
                  } ); 
           }, 
           function (error) {
                executeErrorCallback(option, error);
           });
   }
 
   function createNewDir(path, option) {
       reqFS(fs.config.type, fs.config.size , 
           function (fileSystem) {
               fileSystem.root.getDirectory(path, 
                  CREATE_IF_NOT_FOUND,
                  function (directory) {
                      executeSuccessCallback(option, directory)
                  },
                  function (error) {
                      executeErrorCallback(option, error);
                  } ); 
           }, 
           function (error) {
                executeErrorCallback(option, error);
           });
   }
   
   function deleteFile(path, option) {
       reqFS(fs.config.type, fs.config.size , 
           function (fileSystem) {
               fileSystem.root.getFile(path, 
                  NO_CREATE,
                  function (file) {
                      file.remove(
                          function () {
                              executeSuccessCallback(option, file);
                          }, 
                          function (error) {
                              executeErrorCallback(option, error);
                          })
                  },
                  function (error) {
                      executeErrorCallback(option, error);
                  } ); 
           }, 
           function (error) {
                executeErrorCallback(option, error);
           });
   }
   
   function deleteDir(path, option) {
        if (!isString(path)) {
            path.removeRecursively(
                    function () {
                        executeSuccessCallback(option, path);
                    },
                    function (error) {
                        executeErrorCallback(option, error);
                    })
            return;
        }
        getDir(path, {
            "success": function (dir) {
                dir.removeRecursively(
                    function () {
                        executeSuccessCallback(option, dir);
                    },
                    function (error) {
                        executeErrorCallback(option, error);
                    })
            },
            "error": function (error) {
                executeErrorCallback(option, error);
            }
        });    
   }
   
   function _listFiles(dir, option) {
       var reader = dir.createReader();   
       reader.readEntries(
              function (entryArray) {
                  executeSuccessCallback(option, entryArray) 
              },
              function (error) { 
                  executeErrorCallback(option, error);
              }
       );
   }
   
   function listFiles(path, option) {
       if (!isString(path)) {
           _listFiles(path, option);
           return ;
       }
       reqFS(fs.config.type, fs.config.size , 
           function (fileSystem) {
                var reader = null;
                if (path == "/") {
                     _listFiles(fileSystem.root, option);
                }
                else {
                    fileSystem.root.getDirectory(path, 
                      NO_CREATE,
                      function (dir) {
                          _listFiles(dir, option);
                      },
                      function (error) {
                          executeErrorCallback(option, error);
                      });              
                }
           }, 
           function (error) {
                executeErrorCallback(option, error);
           });
   }
   
   function getFile(path, option) {
         var flag = option["flag"] || NO_CREATE; 
         reqFS(fs.config.type, fs.config.size , 
           function (fileSystem) {
               fileSystem.root.getFile(path, 
                  flag,
                  function (file) {
                      executeSuccessCallback(option, file);
                  },
                  function (error) {
                      executeErrorCallback(option, error);
                  } ); 
           }, 
           function (error) {
                executeErrorCallback(option, error);
           });
   }
   
   function _readFile(reader, mode, file) {
       switch (mode) {
       case "txt": {
            reader.readAsText(file);
            break;
       }
       case "arraybuffer": {
            reader.readAsArrayBuffer(file);
            break
       }
       }
   }
   function readFile(path, option) {
       var mode = option["mode"] || "txt";
       if (!isString(path)) {
           var file = path;
           var reader = new FileReader();
           _readFile(reader, mode, file);
           reader.onloadend = function (event) {
              executeSuccessCallback(option, file, reader.result);
           }
           return ;
       }
       getFile(path, {
           "success": function (fileEntry) {
                  fileEntry.file(
                      function (file) {
                          var reader = new FileReader();
                          _readFile(reader, mode, file);
                          reader.onloadend = function (event) {
                              executeSuccessCallback(option, file, reader.result);
                          }
                      },
                      function (error) {
                          executeErrorCallback(option, error);
                      });
                  
           },
           "error": function (error) {
               executeErrorCallback(option, error);
           }
       })
   }
   
   function writeFile(path, content, option) {
       var mode = option["mode"] || "txt";
       var flag = option["flag"] || NO_CREATE;
       getFile(path, {
           "flag": flag,
           "success": function (fileEntry) {
                  fileEntry.createWriter( function (writer) {
                        var size = 0;
                        writer.onerror = function (error) {
                            executeErrorCallback(option, error);
                        }
                        writer.onwriteend = function () {
                            writer.onwriteend = null;
                            writer.truncate(size);
                            executeSuccessCallback(option);
                            
                        }
                       
                        try {

                             var blob = new Blob([content], {type : 'text/html'});
                            // blobBulder.append(content);
                            // var blob = blobBulder.getBlob();
                            // size = blob.size;
                             
                             writer.write(blob);
                             
                             
                        }
                        catch (e) {
                            console.log(e);
                        }
                       
                  })
                  
           },
           "error": function (error) {
               executeErrorCallback(option, error);
           }
       })
   }
   
   function getDir(path, option) {
         reqFS(fs.config.type, fs.config.size , 
           function (fileSystem) {
               if (path == "/") {
                   executeSuccessCallback(option, fileSystem.root);
                   return;
               }
               fileSystem.root.getDirectory(path, 
                  NO_CREATE,
                  function (dir) {
                      executeSuccessCallback(option, dir);
                  },
                  function (error) {
                      executeErrorCallback(option, error);
                  } ); 
           }, 
           function (error) {
                executeErrorCallback(option, error);
           });
   }
   
   function _move(fromEntry, toEntry, option) {  
       var newName = option["newName"] ? option["newName"] : fromEntry.name;     
       fromEntry.moveTo(toEntry, newName , 
              function (entry) {
                  executeSuccessCallback(option, entry);
              },
              function (error) {
                  executeErrorCallback(option, error);
              })
   }
   
   function move(fromPath, toPath, option) {
       if (!isString(fromPath) && !isString(toPath)) {
            _move(fromPath, toPath, option);
            return ;
       }
       reqFS(fs.config.type, fs.config.size , 
           function (fileSystem) {
               if (!isString(fromPath)) {
                   var fromEntry = fromPath;
                   if (toPath == "/") {
                      _move(fromEntry, fileSystem.root, option); 
                      return;
                   }
                   fileSystem.root.getDirectory(toPath, 
                      NO_CREATE,
                      function (toDir) {
                          _move(fromEntry, toDir, option);
                      },
                      function (error) {
                          executeErrorCallback(option, error);
                      });  
               }
               
           }, 
           function (error) {
                executeErrorCallback(option, error);
           });
   }
   
   function _copy(fromEntry, toEntry, option) {
       
       var newName = option["newName"] ? option["newName"] : fromEntry.name;
       fromEntry.copyTo(toEntry, newName , 
          function (entry) {
              executeSuccessCallback(option, entry);
          },
          function (error) {
              executeErrorCallback(option, error);
          }); 
   }
   
   
   function copy(fromPath, toPath, option) {
       if (!isString(fromPath) && !isString(toPath)) {
            _copy(fromPath, toPath, option);
            return ;
       }
       reqFS(fs.config.type, fs.config.size , 
           function (fileSystem) {
               if (!isString(fromPath)) {
                   var fromEntry = fromPath;
                   fileSystem.root.getDirectory(toPath, 
                      NO_CREATE,
                      function (toDir) {
                          _copy(fromEntry, toDir, option);
                      },
                      function (error) {
                          executeErrorCallback(option, error);
                      });  
               }
               
           }, 
           function (error) {
                executeErrorCallback(option, error);
           });
   }
   
   

   
   function replace(fromEntry, parentEntry, targetEntry, option) {
      var type = option["type"] ? option["type"] : "copy";
      targetEntry.remove(
          function () {
              if (type == "copy") {
                  fromEntry.copyTo(parentEntry, fromEntry.name, 
                      function (entry) {
                          executeSuccessCallback(option, entry);
                      },
                      function (error) {
                          executeErrorCallback(option, error);
                      }); 
              }
              else {
                  fromEntry.moveTo(parentEntry, fromEntry.name, 
                      function (entry) {
                          executeSuccessCallback(option, entry);
                      },
                      function (error) {
                          executeErrorCallback(option, error);
                      }); 
              }
              
          },
          function (error) {
              executeErrorCallback(option, error);
          }
      )
   }
   
   function _findSameNameEntry(formEntry, toEntry, option) {
       if (formEntry.isFile == true) {
           toEntry.getFile(formEntry.name, NO_CREATE, 
               function (file) {
                   if (option && option["found"]) {
                       option["found"](formEntry, toEntry, file);
                   }
               },
               function (error) {
                   if (error.code == FileError.NOT_FOUND_ERR) {
                       if (option && option["nofound"]) {
                           option["nofound"](formEntry, toEntry);
                       }
                   }
               })
       }
       else {
           toEntry.getDirectory(formEntry.name, NO_CREATE, 
               function (dir) {
                   if (option && option["found"]) {
                       option["found"](formEntry, toEntry, dir);
                   }
               },
               function (error) {
                   if (error.code == FileError.NOT_FOUND_ERR) {
                       if (option && option["nofound"]) {
                           option["nofound"](formEntry, toEntry);
                       }
                   }
               })
       }
   }
   
   
   function findSameNameEntry(formPath, toPath, option) {
       if (!isString(formPath) && !isString(toPath)) {
           _findSameNameEntry(formPath, toPath, option);
       }
       reqFS(fs.config.type, fs.config.size , 
           function (fileSystem) {
               if (isString(formPath)) {
                   var getEntry = (option["type"] == "file") ? 
                   fileSystem.root.getFile : fileSystem.root.getDirectory
                   getEntry(formPath, NO_CREATE, 
                       function (formEntry) {
                           if (isString(toPath)) {
                               fileSystem.root.getDirectory(toPath, NO_CREATE, 
                                   function (toDir) {
                                       _findSameNameEntry(formEntry, toDir, option);
                                   },
                                   function (error) {
                                       executeErrorCallback(option, error);
                                   });
                           }
                           else {
                               _findSameNameEntry(formEntry, toPath, option);
                           }
                           
                       },
                       function (error) {
                           executeErrorCallback(option, error);
                       })
               }
               else {
                   if (isString(toPath)) {
                       fileSystem.root.getDirectory(toPath, NO_CREATE, 
                           function (toDir) {
                               _findSameNameEntry(formPath, toDir, option);
                           },
                           function (error) {
                               executeErrorCallback(option, error);
                           });
                   }
                   
               }
           }, 
           function (error) {
                executeErrorCallback(option, error);
           });
   }
   
   function getParentPath(fullPath) {
       if (!isString(fullPath)) {
           fullPath = fullPath.fullPath;
       }
       var parentPath = fullPath.substring(0, fullPath.lastIndexOf("/"));
       if (parentPath == "") {
           return "/";
       }
       return parentPath;
   }
   
   function isParent(parentPath, childPath) {
       return getParentPath(childPath) == parentPath;
   }
   
   function rename(fromPath, newName, option) {
       var parentPath =  getParentPath(fromPath);
       option["newName"] = newName;
       move(fromPath, parentPath , option);         
   }
   
   fs["createNewFile"] = createNewFile;
   fs["createNewDir"] = createNewDir;
   fs["deleteFile"] = deleteFile;
   fs["deleteDir"] = deleteDir;
   fs["listFiles"] = listFiles;
   fs["getFile"] = getFile;
   fs["getDir"] = getDir;
   fs["readFile"] = readFile;
   fs["writeFile"] = writeFile;
   fs["move"] = move;
   fs["copy"] = copy;
   fs["isParent"] = isParent;
   fs["replace"] = replace;
   fs["rename"] = rename;
   fs["findSameNameEntry"] = findSameNameEntry;
   fs["CREATE_IF_NOT_FOUND"] = CREATE_IF_NOT_FOUND;
   fs["NO_CREATE"] = NO_CREATE;
   window.fs = fs;
 
})();
