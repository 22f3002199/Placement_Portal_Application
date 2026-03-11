window.LoginView = {

template:`

<div class="auth-container d-flex justify-content-center align-items-center">

<div class="card auth-card shadow-sm">

<div class="text-center mb-4">

<h2 class="portal-title">Placement Portal</h2>

<p class="text-muted small">Sign in to continue</p>

</div>

<div class="mb-3">

<label class="form-label">Email</label>

<input
type="email"
v-model="email"
class="form-control pastel-input"
placeholder="Enter your email">

<div class="text-danger small">{{emailError}}</div>

</div>

<div class="mb-4">

<label class="form-label">Password</label>

<input
type="password"
v-model="password"
class="form-control pastel-input"
placeholder="Enter your password">

<div class="text-danger small">{{passwordError}}</div>

</div>

<button
class="btn pastel-primary w-100 mb-3"
@click="loginUser">

Login

</button>

<div class="text-center text-muted mb-3 small">

New here?

</div>

<div class="d-grid gap-2">

<button
class="btn pastel-outline"
@click="goStudent">

Register as Student

</button>

<button
class="btn pastel-outline"
@click="goCompany">

Register as Company

</button>

</div>

</div>

</div>

`,

created(){

const user = JSON.parse(localStorage.getItem("user"))

if(user){

if(user.role==="admin") navigate("/admin-dashboard")

if(user.role==="student") navigate("/student-dashboard")

if(user.role==="company") navigate("/company-dashboard")

}

},

data(){
return{

email:"",
password:"",
emailError:"",
passwordError:""

}
},

methods:{

validate(){

this.emailError=""
this.passwordError=""

const emailRegex=/^[^@\s]+@[^@\s]+\.[^@\s]+$/

let valid=true

if(!this.email || !emailRegex.test(this.email)){
this.emailError="Enter a valid email"
valid=false
}

if(!this.password){
this.passwordError="Password required"
valid=false
}

return valid
},

async loginUser(){

if(!this.validate()) return

const response = await fetch("http://127.0.0.1:5000/api/login",{

method:"POST",
credentials:"include",
headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
email:this.email,
password:this.password
})

})

const data = await response.json()

if(response.ok){

localStorage.setItem("user", JSON.stringify(data))

if(data.role==="admin") navigate("/admin-dashboard")
if(data.role==="student") navigate("/student-dashboard")
if(data.role==="company") navigate("/company-dashboard")

}else{

alert(data.error)

}

},

goStudent(){ navigate("/register-student") },

goCompany(){ navigate("/register-company") }

}

}