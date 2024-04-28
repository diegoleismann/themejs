const fs = require('fs');
const path = require('path');

function Theme(config){
    const rootTheme = config.theme;
    const styles = []
    let data = {}
    function routes(router){
        return async function (req, res) {
            const {route, params} = routerMatch(req.url, router);
            if(route === "file"){
                return themePublic(req.url, res)
            }
            try{ 
                const theme = {}
                viewTemplate = await templateParse(route.view, theme);
                theme.view =  ()=> viewTemplate
                theme.title = ()=> data.title || config.title || "";
                const htmlTemplate = await templateParse(route.layout, theme)
                return res.end(htmlTemplate)
            }catch(e){
                console.log(e)
                return res.end("404")
            }
            
        }
    }
    function routerMatch(url, router){
        if(/^[/]public[/]([a-zA-Z0-9/-]+)[.]([a-zA-Z0-9]){2,5}$/.test(url)){
           return {route:"file", params:{}}
        }
        let routeMatch = null;
        let paramsMatch = null;
        for(const route in router){
            const path = route.split("/")
            const pathUrl = url.split("/")
            let params = {}
            let i = 0
            let match=0
            
            for(param of path){
                if(/^[$][{]([a-zA-Z0-7]+)[}]$/.test(param) && pathUrl[i] != ''){
                    const r = param.match(/^[$][{]([a-zA-Z0-7]+)[}]$/)
                    params[r[1]] = pathUrl[i]
                    match++
                    i++;
                    continue;
                }
                if(param == pathUrl[i]){
                    match++
                    i++;
                }
                
            }
            if(match === path.length){
                routeMatch = router[route];
                paramsMatch = params;
                break;
            }
            params = {} 
        }
        
        return {route: routeMatch, params: paramsMatch}
    }
    function loadFile(fileName){
        return new Promise((resolve, reject) => {
            fs.readFile(path.resolve(__dirname, fileName), (error, htmlString) => {
                if (!error && htmlString) {
                    resolve(htmlString);
                } else {
                    console.log(error);
                    resolve("");
                }
            });
            
        });
    }
    function themeComponent(name, components, theme){
        try{
            
            const template = components[name];
            let htmlTemplate = "<!-- componente "+name+" não encontrado -->"
            eval("htmlTemplate = `"+template+"`");
            return htmlTemplate;
        }catch(e){
            console.log(e);
            return "<!-- componente "+name+" não encontrado -->"
        }
        
    }
    

    async function templateParse(scope, theme){
        const controller = require("../"+rootTheme+scope.data);
        const template = await loadFile("../"+rootTheme+scope.template);
        const data = controller(themeApi)
        const components = await preloadComponent(data.components);
        theme.component = (name)=>themeComponent(name, components, theme);
        let htmlTemplate="";
        eval("htmlTemplate = `"+template+"`");
        return htmlTemplate
    }


    async function themePublic(filePath, res){
        let extname = String(path.extname(filePath)).toLowerCase();
        let mimeTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.wav': 'audio/wav',
            '.mp4': 'video/mp4',
            '.woff': 'application/font-woff',
            '.ttf': 'application/font-ttf',
            '.eot': 'application/vnd.ms-fontobject',
            '.otf': 'application/font-otf',
            '.wasm': 'application/wasm',
            '.ico' : 'image/x-icon'
        };

        let contentType = mimeTypes[extname] || 'application/octet-stream';
        const fileContent = await loadFile("../"+rootTheme+"/"+filePath)
        if(fileContent){
            res.writeHead(200, { 'Content-Type': contentType });
            res.write(fileContent);
            res.end();
        }

        if(!fileContent){
            res.writeHead(404, { 'Content-Type': "text/plain" });
            res.end("404", 'utf-8');
        }

        
    }
    async function preloadComponent(listComponents){
        const components = []
        for(const component in listComponents){
            const configComponent = listComponents[component];
            components[component] = await loadFile("../"+rootTheme+configComponent.template);
        }
        return components;
    }

    
    const themeApi = {}
    return {routes}
}
module.exports = Theme