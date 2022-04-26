
var vueData={
    el: '#app',
    data: {
        contents : {
            "title" : "Loading"
        },
        appLayout: "",
        debug: false
    },
    created:function(){
    },
    mounted:function(){
        console.log("mounted");
        this.$el.className+=" loaded";
        this.appLayout="router";
    },
    methods: {

    }
}

Vue.use(VueRouter)
Vue.use(Vuex)
Vue.use(language)

document.addEventListener("deviceready",function(){
    for(var idx in language.list){
        var key=language.list[idx]
        loadData('data/'+key+'/app.json',function(data){
            var result = JSON.parse(data)
            if (result){
                language.add(result)
            }
        })    
    }
    loadComponents(components,function(){ 
        vueData.router = getRouter()
        vueData.store = getStore()
        vueApp = new Vue(vueData);
    },0)
});

if (!window.cordova && !window.ae){
    var event = new CustomEvent('deviceready');
    document.dispatchEvent(event);
}
if (!window.cordova){
    document.body.setAttribute('phone','false')
} else {
    document.body.setAttribute('phone','true')
}

