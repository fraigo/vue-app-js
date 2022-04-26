var  audioEngine = new WebAudio();

var audioId= function(id){
    id = id.toLowerCase()
    id = id.replace(/á/g,'a')
    id = id.replace(/é/g,'e')
    id = id.replace(/í/g,'i')
    id = id.replace(/ó/g,'o')
    id = id.replace(/ú/g,'u')
    id = id.replace(/¿/g,'')
    id = id.replace(/!/g,'')
    id = id.replace(/\?/g,'')
    id = id.replace(/,/g,'')
    id = id.replace(/:/g,'')
    id = id.replace(/\./g,'')    
    return id
}

var audioProcs = [];
var activeAudios = {};
var backgroundVolume = 0.5;
var audioVolume = 1;

var stopAudio = function(word){
    var audio1 = audioId(word)
    audioEngine.stop(audio1)
}

var playBackground = function(word, callback, loops){
    var audio1 = audioId(word)
    playAudio(word, callback, loops, backgroundVolume, true)
}

var playAudio= function(word, callback, loops, volume, forceVolume) {
    if (window.WEBAUDIO_DEBUG) console.log('playAudio',word,loops)
    var audio1 = audioId(word)
    if (typeof volume == 'undefined') {
        volume = audioVolume
    }
    if (!forceVolume){
        volume = Math.min(audioVolume, volume)
    }
    if (volume>=0){
        audioEngine.setVolume(audio1,volume)
    }
    loops = loops || 1
    audioEngine.playFromStart(audio1)
    activeAudios[audio1]=audio1;
    var time=audioEngine.duration(audio1)
    setTimeout(function(){
        delete activeAudios[audio1]
    },time)
    var proc=setTimeout(function(){
        if (loops==1){
            if (callback){
                callback()
            }
        }
        if (loops>1) {
            playAudio(word, callback, loops-1)
        }
    }, time)
    audioProcs.push(proc)
    return proc
}

var stopSounds= function(){
    for(var idx=audioProcs.length-1; idx>=0; idx--) {
        clearTimeout(audioProcs[idx])
        audioProcs.splice(idx,1)
    }
}

var loadAudios=function(audioList,lang,callback){
    var audios={};
    for(var idx=0; idx< audioList.length; idx++) {
        var audio1 = audioId(audioList[idx])
        var base = document.location.pathname.replace("index.html","")
        if (window.Media && window.device){
            base = ""
        }
        var audioName = audio1
        var parts=audioName.split('.')
        var ext=parts.pop()
        if (ext!="mp3" && ext!="wav"){
            audioName = audio1 + ".wav"
        } else {
            audio1=parts.join(".")
        }
        audios[audio1]=base+"audio/"+lang+"/"+audioName;
    }
    console.log('loading ',Object.keys(audios).join(','));
    audioEngine.loadList(audios, function(result, p1) {
        console.log('loaded ',result)
    }, function(id, error) {
        (console.warn||console.log)('Load error',id,audios[id])
    }, function(){
        if (callback) {
            callback();
        }
    })
}

var playSequence= function (list, itemCallback, endCallback) {
    var time = 50
    stopSounds()
    for(var idx=0; idx< list.length; idx++) {
        var audio1 = audioId(list[idx])
        var duration1 = audioEngine.duration(audio1);
        console.log('play', audio1, duration1)
        var proc=setTimeout(function(idx,audio,duration){ 
            if (itemCallback) {
                itemCallback(idx,audio,duration)
            } else {
                playAudio(audio)
            }
        },time,idx,audio1,duration1)
        audioProcs.push(proc);
        time+=duration1;
    }
    var proc2=setTimeout(function(){ 
        if (endCallback) {
            endCallback()
        }
    }, time+200)
    audioProcs.push(proc2);
}