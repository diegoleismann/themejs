module.exports = (theme)=>{
        const data = {menu: []}
        return {
            components:{
                logo: {template:"/components/logo.html"},
                menuHeader: {
                    template:"/components/menu-header.html", 
                    data:{
                        menu: data.menu, 
                        item: "item"
                    }
                },
            }   
            
       }   
}
