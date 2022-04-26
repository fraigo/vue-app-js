
function getRouter(){
    var skipSplash = window.device && device.platform.toLowerCase() === "ios"
    var routes = [
        { path: '/', component: skipSplash ? null : Splash, redirect: skipSplash ? '/home' : null },
        { path: '/home', component: App },
        { path: '/home/:contentId', component: App, props: true },
    ]
    var router = new VueRouter({
        routes: routes
    })
    router.beforeEach(function(to, from, next) {
        console.log('route',from.path,'to',to.path)
        var backToOrigin = to.path=='/' && from.path!='/'
        if (backToOrigin){
            next(false)
        } else {
            next()
        }
    })
    return router
}
