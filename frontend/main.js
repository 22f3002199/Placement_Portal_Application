const { createApp, h } = Vue

createApp({

data(){
return{

currentRoute: window.location.hash.slice(1) || "/",

user: JSON.parse(localStorage.getItem("user"))

}
},

methods:{

protectRoute(route){

const publicRoutes = [
"/",
"/login",
"/register-student",
"/register-company"
]

if(!this.user){

if(!publicRoutes.includes(route)){
return "/login"
}

return route
}

if(this.user.role === "admin" && 
(route === "/admin-dashboard" || route === "/company-details" || route === "/drive-details" || route === "/application-details")
)
return route

if(this.user.role === "student" && 
    (route === "/student-dashboard" || route === "/application-history" || route === "/drive-details-student" || route === "/company-details-student" || route === "/student-edit-profile")
)
return route

if(
this.user.role === "company" &&
(route === "/company-dashboard" || route === "/create-drive" || route === "/application-company-details")
)
return route

if(publicRoutes.includes(route))
return route

// fallback redirect based on role

if(this.user.role === "admin") return "/admin-dashboard"
if(this.user.role === "student") return "/student-dashboard"
if(this.user.role === "company") return "/company-dashboard"

return "/login"

}

},

computed:{

ViewComponent(){

const protectedRoute = this.protectRoute(this.currentRoute)

if(protectedRoute !== this.currentRoute){

this.currentRoute = protectedRoute
window.location.hash = protectedRoute

}

return window[routes[protectedRoute]]

}

},

render(){
return h(this.ViewComponent)
},

created(){

window.addEventListener("hashchange", () => {

this.currentRoute = window.location.hash.replace("#","") || "/"

this.user = JSON.parse(localStorage.getItem("user"))

})

}

}).mount("#app")