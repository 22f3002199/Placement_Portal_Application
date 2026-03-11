window.Navbar = {

template:`

<nav class="navbar pastel-navbar px-3 py-2">

<div class="container-fluid">

<span class="navbar-brand portal-brand">
Placement Portal
</span>

<div v-if="user" class="dropdown">

<button
class="btn pastel-user-btn dropdown-toggle d-flex align-items-center"
data-bs-toggle="dropdown">

<img
:src="avatarUrl"
class="rounded-circle me-2 avatar-img">

<span class="user-role">{{userRole}}</span>

</button>

<ul class="dropdown-menu dropdown-menu-end shadow-sm">

<li v-if="user.role === 'student'">
<a class="dropdown-item" @click="editProfile">
Edit Profile
</a>
</li>

<li v-if="user.role === 'student'">
<hr class="dropdown-divider">
</li>

<li>
<a class="dropdown-item text-danger" @click="logout">
Logout
</a>
</li>

</ul>

</div>

</div>

</nav>

`,

data(){
return{
user: JSON.parse(localStorage.getItem("user"))
}
},

computed:{

userRole(){
if(!this.user) return ""
return this.user.role.toUpperCase()
},

avatarUrl(){

if(this.user && this.user.avatar){
return this.user.avatar
}

return "https://cdn-icons-png.flaticon.com/512/149/149071.png"

}

},

methods:{

logout(){
localStorage.removeItem("user")
navigate("/login")
},

editProfile(){
navigate("/student-edit-profile")
}

}

}