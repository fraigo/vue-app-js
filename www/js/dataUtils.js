
function listDir(path) {
    window.resolveLocalFileSystemURL(path,
        function (fileSystem) {
            var reader = fileSystem.createReader();
            reader.readEntries(
                function (entries) {
                    console.log(entries);
                },
                function (err) {
                    console.log('readentries',err);
                }
            );
        }, function (err) {
            console.log('listdir',err);
        }
    );
}

function readLocalFile(file, callback, error){
    if (window.resolveLocalFileSystemURL){
        window.resolveLocalFileSystemURL(file,function(entry){
             entry.file(function (file) {
                var reader = new FileReader();
                reader.onloadend = function() {
                        callback(this.result);
                };
                reader.readAsText(file);
                })
             }, error)
    }else if (error){
        error("Can't load file");
    }
}



var loadData=function(url,callback, error){

    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onreadystatechange = function (aEvt) {
        if (req.readyState == 4) {
            if(req.status == 200){
                callback(req.responseText);
            }
            else{
                if (!window.cordova){
                    if (error) {
                        error("Error loading")
                    }
                    return;
                }
                var file=cordova.file.applicationDirectory+"www/"+url;
                readLocalFile(file,callback,error);
            }
        }
    };
    req.onerror=function(err){
        console.log('XHR Error',err)
        console.log(url)
        if (!window.cordova){
            if(error){
                error("Error loading "+url+" "+err);
            }
            return;
        }
        var file=cordova.file.applicationDirectory+"www/"+url;
        readLocalFile(file,callback,error);
    }
    req.send(null)
}
