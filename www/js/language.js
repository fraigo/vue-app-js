var language = {
    "es" : {
        "lang" : "es",
        "lang_name": "Español",
        "app_name": "App",
        "language": "Idioma",
        "select_language": "Seleccionar Idioma",
    },
    "en" : {
        "lang" : "en",
        "lang_name": "English",
        "app_name": "App",
        "language": "Language",
        "select_language": "Select Language",
    },
    "selected" : "en"
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
    if (!lang) lang = language
    var key = language.key(expr)
    return lang[language.selected] && lang[language.selected][key]
}

language.translate = function(expr, lang) {
    if (!lang) lang = language
    expr = language.expr(expr, lang)
    var key = language.key(expr)
    if (lang[language.selected] && lang[language.selected][key]){
        return lang[language.selected][key]
    }
    return expr
}

language.expr = function(content,lang) {
    var result = content
    if (!lang) lang = language
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

language.key = function(content){
    return language.id(content)
}
