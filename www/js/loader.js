
window.sassCompiler = null
try {
    window.sassCompiler = window.Sass ? new Sass() : null;
} catch(e){
    console.log('Error loading Sass compiler: '+e)
}

var loadImages = function(images,imageCallback,endCallback,pos,keys){
    var img = new Image()
    pos = pos || 0
    if (!keys) {
        keys = []
    }
    if (!Array.isArray(images)){
        var items = images
        images = []
        for(var key in items){
            images.push(items[key])
            keys.push(key)
        }
    }
    img.onload=function(){
        if (pos+1<images.length){
            if(imageCallback){
                imageCallback(this,this.sourcePath,this.imageKey)
            }
            loadImages(images,imageCallback,endCallback,pos+1,keys);
        } else if (endCallback){
            endCallback()
        }
    }
    console.log('Loading', images[pos])
    img.imageKey=keys[pos]||pos
    img.sourcePath = images[pos]
    img.src=images[pos]
}

var loadComponent = function(id, callback){
    var suffix = '?' + (new Date()).getTime();
    var componentFile = "components/"+id+".html"
    loadData(componentFile+suffix,function(text){
        var e=document.createElement("div");
        e.id="component-"+id
        var innerText = text 
        var pos1=text.indexOf("<style")
        if (pos1>0){
            var prefix = text.substring(0,pos1-1)
            var lines=prefix.split('\n').length
            var extra=""
            for(var i=0;i<lines;i++){
                extra+='\n';
            }
            innerText=innerText.replace('<style>','<style>'+extra)
        }
        innerText = innerText.replace('</style>',"/*# sourceURL="+componentFile+'*/\n</style>')
        e.innerHTML = innerText
        var loaded = false
        var scripts=e.querySelectorAll("script[type='text/javascript']");
        var scssStyles=e.querySelectorAll("style[lang='scss']");
        if (scssStyles.length && !window.sassCompiler){
            console.log("ERROR: No scss compiler available for "+id+".html")
        }
        if (scssStyles.length && window.sassCompiler){
            for(var i=0; i<scssStyles.length; i++){
                var style = scssStyles[i]
                var scss = style.innerHTML
                style.parentNode.removeChild(style)
                sassCompiler.compile(scss, function(result) {
                    var st = document.createElement("style")
                    st.id="style-"+id
                    st.innerHTML = result.text
                    document.body.appendChild(st)
                    if (!loaded){
                        callback(text)
                        loaded = true
                    }
                });
            }
        }
        for(var i=0; i<scripts.length; i++){
            var script=scripts[i];
            if (script.src){
                var sc=document.createElement("SCRIPT");
                sc.src=script.src;
                document.body.appendChild(sc);
            }else{
                var prefix="// "+componentFile+"\n"
                var lines = text.split("\n");
                for(var i=2; i<lines.length; i++){
                    prefix+="\n"
                    if (lines[i].indexOf("text/javascript")>0) {
                        break;
                    }
                }
                var post = "//# sourceURL="+componentFile+".js"
                eval(prefix+script.innerHTML+post);
            }    
        }
        document.body.appendChild(e);
        if (!scssStyles || scssStyles.length==0){
            callback(text);
        }
    },function(err){
        console.log('load error', err);
    })
}

var loadComponents=function(list,callback, pos){
    if (!pos){
        pos=0;
    }
    if (!list[pos]){
        callback(pos);
        return;
    }
    loadComponent(list[pos],function(text){
        loadComponents(list, callback, pos+1);
    })
}
