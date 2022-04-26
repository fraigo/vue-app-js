var languageList = (window.config && window.config.languageList) ? window.config.languageList : ['en','es']
var language = {
    "en" : {
        "lang" : "en",
        "lang_name": "English",
        "app_name": "App",
        "language": "Language",
        "select_language": "Select Language",
    },
    "es" : {
        "lang" : "es",
        "lang_name": "Español",
        "app_name": "App",
        "language": "Idioma",
        "select_language": "Seleccionar Idioma",
    },
    "fr" : {
        "lang" : "fr",
        "lang_name": "Français",
        "app_name": "App",
        "language": "Lange",
        "select_language": "Choisir la langue",
    },
    "list": languageList,
    "selected" : "en"
}

if (window.config && window.config.defaultLanguage){
    for (var lang in window.defaultLanguage){
        for (var key in defaultLanguage[lang]){
            language[lang][key] = defaultLanguage[lang][key]
        }
    }    
}

language.id = function(expr){
    if (typeof(expr) == "undefined") {
        return expr
    }
    var id=expr.toLowerCase().replace(/ /g,'_').replace('?','').replace('(','').replace(')','')
    var replaced="áéíóú"
    var replacing="aeiou"
    for (var index = 0; index < replaced.length; index++) {
        id = id.replace(replaced.charAt(index), replacing.charAt(index));
    }
    return id
}

language.hasTranslation = function(expr, lang) {
    if (!lang) lang = language.selected
    var key = language.key(expr)
    return language[lang] && language[lang][key]!=null
}

language.translate = function(expr, lang) {
    if (!lang) lang = language.selected
    if (expr==null){
        return expr
    }
    expr = language.expr(expr, lang)
    var key = language.key(expr)
    if (language[lang] && language[lang][key]){
        return language[lang][key]
    }
    return expr
}

language.expr = function(content,lang) {
    var result = content
    if (!lang) lang = language.selected
    if (!content) return content
    if (typeof content == 'number') result = '' + result
    if (result.indexOf('{')>=0){
        var elements = result.match(/{[^{]+}/g)
        for (var idx = 0; idx < elements.length; idx++) {
            var reemp = elements[idx].substring(1,elements[idx].length-1)
            if (language.hasTranslation(reemp, lang)){
                result=result.replace(elements[idx],language.translate(reemp, lang))
            }
        }
    }
    return result
}

language.add=function(items){
    for(var lang in items){
        for (var key in items[lang]){
            language[lang][key]=items[lang][key]
        }
    }
}

language.setLanguage=function(id){
    language.selected = id
    if (language.languageChangeListener){
        language.languageChangeListener(id)
    }
}

language.getLanguage=function(){
    return language.selected
}

language.key = function(content){
    return language.id(content)
}

language.languageChangeListener = null

language.onLanguageChange = function(callback){
    language.languageChangeListener=callback
}

language.install = function (Vue, options) {
    Vue.prototype.$tr=language.translate
    Vue.prototype.$ex=language.expr
    Vue.prototype.$selectedLang=language.getLanguage
    Vue.prototype.$onLanguageChange=language.onLanguageChange
}