var WEBAUDIO_DEBUG = false;
var WEBAUDIO_MULTI = true;


function WebAudio() {

    this.audios = {};
    this.currentAudio = null;
    this.device = null;
    this.muted == false;

}

WebAudio.prototype.loadList = function (items, successCallback, errorCallback, endCallback) {
    var itemsToLoad = items.length ? items.length : Object.keys(items).length;
    //var items = JSON.parse(JSON.stringify(items))
    var itemsLoaded = 0;
    var errors = [];
    var loaded = [];
    var self = this;
    var keys = Object.keys(items);
    if (keys.length == 0){
        if (WEBAUDIO_DEBUG) console.log('end loading');
        return
    }
    var audioid = keys[0];
    if (WEBAUDIO_DEBUG) console.log('loading', audioid, keys.length);
    this.load(items[audioid],audioid,
        function(audio,id){
            itemsLoaded++;
            loaded.push(id);
            if (WEBAUDIO_DEBUG) console.log('loaded',id, itemsToLoad)
            if (successCallback){
                successCallback(id,audio);
            }
            delete items[audioid]
            if (Object.keys(items).length==0 && endCallback){
                endCallback();
            }
            self.loadList(items, successCallback, errorCallback, endCallback)
        },function(error,id){
            if (WEBAUDIO_DEBUG) console.log('error',id,itemsToLoad)
            if (errorCallback){
                errorCallback(id,error);
            }
            delete items[audioid]
            if (Object.keys(items).length==0 && endCallback){
                endCallback();
            }
            self.loadList(items, successCallback, errorCallback, endCallback)
        }
    )
}



WebAudio.prototype.load = function (url, id, successCallback, errorCallback) {
    if (!id) {
        id = Math.round(Math.random() + 10000000);
    }
    var self = this;
    if (WEBAUDIO_DEBUG) console.log("WebAudio Loading",id,url)
    if (window.Media && (device.platform.toLowerCase() === "androidx" || device.platform.toLowerCase() === "ios")) {
        self.device = device.platform.toLowerCase();
        var mediaUrl = url;
        if (window.device && device.platform.toLowerCase() === "android"){
            mediaUrl = '/android_asset/' + 'www/' + url;
        }
        if (window.device && device.platform.toLowerCase() === "ios"){
            mediaUrl = cordova.file.applicationDirectory.replace("file://","") + "www/" + url;
        }
        if (url.indexOf("file://")==0){
            mediaUrl = url.replace("file://","");
        }
        if (url.indexOf("://")>0){
            mediaUrl = url;
        }
        if (WEBAUDIO_DEBUG) console.log('Loading Media', mediaUrl, 'from', url);
        var ready = false;
        var audio = new Media(mediaUrl,
            function () {
                if (WEBAUDIO_DEBUG) console.log('WebAudio Loaded', id, audio.currentStatus);
            },
            function (e) {
                if (WEBAUDIO_DEBUG) console.log('WebAudio Error', id, mediaUrl, error)
                if (!audio.currentStatus){
                    console.log('Load error', id, audio.currentStatus);
                    if (errorCallback) errorCallback(e,id);    
                }
            },
            function (s) { 
                audio.currentStatus = s;
                if (WEBAUDIO_DEBUG) console.log('WebAudio Status', id, s, audio.getDuration(), ready); 
                if (audio.getDuration()>-1 && !ready){
                    ready = true;
                    audio.stop();
                    audio.currentTime = 0;
                    self.audios[id] = audio;
                    audio.setVolume(1.0);
                    audio.volume = 1.0;
                    if (WEBAUDIO_DEBUG) console.log('WebAudio Ready', id);
                    successCallback(audio,id,url);
                }
                audio.paused = (s == 3 || s == 4)
            }
        );
        this.currentAudio = audio;
        try {
            audio.play();
            audio.setVolume(0);
        } catch (e) {

        }
    } else {
        var audio = this.currentAudio && !WEBAUDIO_MULTI?this.currentAudio:document.createElement("audio");
        window.defaultWebAudio=audio;
        audio.setAttribute("style","display:none")
        if (WEBAUDIO_DEBUG) console.log('WebAudio MediaURL', url);
        audio.setAttribute("src", url);
        audio.setAttribute('preload', 'metadata');
        audio.onloadedmetadata=function(ev){
            if (audio.duration>0){
                self.audios[id] = audio;
                if (WEBAUDIO_DEBUG) console.log("WebAudio duration1", id, audio.duration);
                if (successCallback) {
                    successCallback(audio,id);
                }
                audio.onloadedmetadata=null;    
            }else{
                if (WEBAUDIO_DEBUG) console.log("WebAudio duration2", id, audio.duration);
                setTimeout(function(){
                    if (WEBAUDIO_DEBUG) console.log("WebAudio duration3", audio.duration);
                },1000)
            }
        },
        audio.oncanplay = function (event) {
            // console.log('Audio Ready', id, audio.duration);
            /*self.audios[id] = audio;
            
            if (successCallback) {
                successCallback(audio,id);
            }
            audio.oncanplay=null;
            */
        }
        audio.onerror = function (e) {
            console.log('WebAudio Error', id, url);
            if (errorCallback) {
                errorCallback(e,id);
            }
        }
        document.body.appendChild(audio);
        if (window.device){
            if (WEBAUDIO_DEBUG) console.log('WebAudio device', device.platform.toLowerCase());
            if (device.platform.toLowerCase() === "ios"){
                audio.load();
            }else{
                if (WEBAUDIO_DEBUG) console.log('Non-iOS');
            }
        }else{
            if (WEBAUDIO_DEBUG) console.log('WebAudio Noplugin');
        }
        this.currentAudio = audio;
    }

}

WebAudio.prototype.playFromStart = function (id, onend) {
    this.setCurrentTime(id, 0)
    this.play(id, onend)
}

WebAudio.prototype.play = function (id, onend) {
    if (WEBAUDIO_DEBUG) console.log('WebAudio Play',id)
    if (this.muted) return
    var audio = this.audios[id];
    if (audio) {
        if (this.device!=null){
            audio.play({ playAudioWhenScreenIsLocked : true });
            var audioPosition = 0;
            audio.getCurrentPosition(function (position) {
                if (WEBAUDIO_DEBUG) console.log('WebAudio Position', position)
                audioPosition = Math.max(0,position);
                audio.currentTime = audioPosition;
            })
            setTimeout(function(){
                audio.getCurrentPosition(function (position) {
                    var duration = audio.getDuration(id)
                    if (WEBAUDIO_DEBUG) console.log('WebAudio check position', position, duration)
                    audio.currentTime = Math.max(0,position);
                    if (audioPosition == Math.max(0,position) && duration>500) {
                        if (WEBAUDIO_DEBUG) console.log('WebAudio FixPlay', audioPosition)
                        audio.play({ playAudioWhenScreenIsLocked : true });
                    }
                })
            },500)
        }else{
            audio.play();
            if (onend) {
                audio.onended = onend
            }
        }
    }
}



WebAudio.prototype.isPlaying = function (id) {
    var audio = this.audios[id];
    if (audio) {
        return !audio.paused;
    }
}


WebAudio.prototype.togglePlay = function (id) {
    var audio = this.audios[id];
    if (WEBAUDIO_DEBUG) console.log('WebAudio Toggleplay',id, 'paused', audio && audio.paused)
    if (audio) {
        if (audio && audio.paused) {
            audio.play();
        }
        else if (audio && !audio.paused) {
            audio.pause();
        }
    }
}


WebAudio.prototype.stop = function (id) {
    var audio = this.audios[id];
    if (WEBAUDIO_DEBUG) console.log('WebAudio Stop',id)
    if (audio) {
        if (audio.stop){
            audio.stop();
        }else{
            this.setCurrentTime(id, 0)
            audio.pause();    
        }
    }
}

WebAudio.prototype.pause = function (id) {
    var audio = this.audios[id];
    if (audio) {
        if (this.isPlaying(id)){
            audio.pause();
        }
    }
}

WebAudio.prototype.duration = function (id) {
    var audio = this.audios[id];
    if (audio) {
        if (audio.getDuration) {
            return Math.round(audio.getDuration() * 1000)
        }
        return audio.duration * 1000;
    }
}

WebAudio.prototype.setVolume = function(id,value){
    var audio = this.audios[id];
    if (audio) {
        if (audio.setVolume){
            audio.volume = value;
            audio.setVolume(audio.volume);
        }else{
            audio.volume = value
        }
    }
}

WebAudio.prototype.getVolume = function(id){
    var audio = this.audios[id];
    if (audio) {
        return audio.volume
    }
}

WebAudio.prototype.isMuted = function(id){
    var audio = this.audios[id];
    if (audio) {
        return audio.muted
    }
    return false
}

WebAudio.prototype.setMuted = function(id, muted){
    var audio = this.audios[id];
    if (audio) {
        audio.muted = muted
    }
}

WebAudio.prototype.currentTime = function (id) {
    var audio = this.audios[id];
    if (audio) {
        if (audio.getCurrentPosition) {
            audio.getCurrentPosition(function (position) {
                audio.currentTime = Math.max(0,position);
            })
        }
        return Math.max(0,audio.currentTime * 1000);
    }
}

WebAudio.prototype.setCurrentTime = function (id, milliseconds) {
    var audio = this.audios[id];
    if (audio) {
        if (audio.seekTo) {
            audio.seekTo(Math.min(milliseconds, audio.getDuration() * 1000 - 500))
        } else {
            audio.currentTime = milliseconds / 1000;
        }
    }
}

WebAudio.prototype.secToTime = function (seconds) {
    var dec = Math.round(seconds*10) % 10
    seconds = Math.max(0,Math.round(seconds))
    var sec = ("0" + seconds % 60).slice(-2);
    var min = ("0" + (seconds - sec) / 60).slice(-2);
    return min + ":" + sec + "." + dec;

}

WebAudio.prototype.currentTimeText = function (id) {
    var audio = this.audios[id];
    if (audio) {
        var milliseconds = Math.max(0,this.currentTime(id));
        return this.secToTime(milliseconds/1000)
    }
}