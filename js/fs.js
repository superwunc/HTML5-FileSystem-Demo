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
   
   function executeErrorCallback(option, args) {
       if (option && option["error"]) {
           var param = [];
           for (var i = 1, l = arguments.length; i < l; i++) {
                param.push(arguments[i]);
           }
           option["error"].apply(window, param);
       }
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
                        var blob = new BlobBuilder();
                        blob.append(content);
                        writer.write(blob.getBlob());
                        executeSuccessCallback(option);
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
   
   fs["createNewFile"] = createNewFile;
   fs["createNewDir"] = createNewDir;
   fs["deleteFile"] = deleteFile;
   fs["deleteDir"] = deleteDir;
   fs["listFiles"] = listFiles;
   fs["getFile"] = getFile;
   fs["getDir"] = getDir;
   fs["readFile"] = readFile;
   fs["writeFile"] = writeFile;
   fs["CREATE_IF_NOT_FOUND"] = CREATE_IF_NOT_FOUND;
   fs["NO_CREATE"] = NO_CREATE;
   window.fs = fs;
 
})();
