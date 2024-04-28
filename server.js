const http = require('http');
const Theme = require('./core/theme.js');
const theme = new Theme({theme: "hello-theme"})
const layout  = { template:"/site.html", data:"/site.js"}
const viewHome  = { template: "/view/home/home.html", data:"/view/home/home.js"}
const viewPage = { template: "/view/page/page.html", data:"/view/page/page.js"}
const viewPost = { template: "/view/post/post.html", data:"/view/post/post.js"}
const view404 = { template: "/view/404/404.html", data:"/view/404/404.js"}
const router = {
    "/page":{
      layout,
      view: viewPage
    },
    "/post":{
      layout,
      view: viewPost
    },
    "/${id}":{
      layout,
      view: view404
    },
    "/":{
      layout,
      view: viewHome
    },

}
const server = http.createServer(theme.routes(router));

const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});