function getStore(){
    var savedItems = ['config','scores']
    var store = new Vuex.Store({
        state: {
          limit: 10,
          config: {
            backgroundMusic: true,
            soundEffects: true
          },
          scores: JSON.parse(JSON.stringify(initialScores)),
          tempScores: JSON.parse(JSON.stringify(initialScores))
        },
        mutations: {
          config: function(state,opts){
            for(var key in opts){
              state.config[key] = opts[key]
            }
            this.commit('save')
          },
          score: function(state, cfg) {
            var key = cfg[0]
            var value = cfg[1]
            var max = cfg[2] || 99999
            var linear = cfg[3]
            console.log('score',key,value, max, linear)
            if (!value) return
            state.tempScores[key]=state.scores[key]
            if (state.scores[key]+value<0){
                state.scores[key]=0
            }
            else if (state.scores[key]+value>max){
                state.scores[key]=max
            } else{
                state.scores[key]+=value
            }
            //console.log('score',key,key,state.tempScores[key],'to',key,state.scores[key])
            clearInterval(state.procs[key])
            state.procs[key] = setInterval(function(){
              var diff = Math.round((state.scores[key]-state.tempScores[key])/2)
              if (Math.abs(diff)<=1){
                state.tempScores[key]=state.scores[key]
              } else {
                if (linear && diff>0){
                  diff = 1
                }
                if (linear && diff<0){
                  diff = -1
                }
                state.tempScores[key]+=diff
              }
              if (state.scores[key]==state.tempScores[key]){
                clearInterval(state.procs[key])
                return
              }
            },linear?50:100)
            this.commit('save')
          },
          clearScore: function(state,key){
            state.scores[key]=0
            state.tempScores[key]=0
            this.commit('save')
          },
          load: function(state){
            console.log('LOAD SCORES')
            for (var key in savedItems){
              var name = savedItems[key]
              var valueData=localStorage.getItem("exampleapp."+name)
              if (valueData && valueData.length){
                  state[name]=JSON.parse(valueData)
                  if (state.tempScores && name=='scores'){
                    state.tempScores=JSON.parse(valueData)
                  }
              }
            }
            this.commit('save')
          },
          save: function(state){
            backgroundVolume = state.config.backgroundMusic ? 0.5 : 0
            audioVolume = state.config.soundEffects ? 1 : 0
            for (var key in savedItems){
              var name = savedItems[key]
              localStorage.setItem("exampleapp."+name,JSON.stringify(state[name]))
            }
          },
          reset: function(state){
            for (var key in savedItems){
              var name = savedItems[key]
              localStorage.setItem("exampleapp."+name,"")
            }
            localStorage.setItem("exampleapp.scores",JSON.stringify(initialScores))
            document.location="./index.html"
          }
        }
    })
    return store;
}