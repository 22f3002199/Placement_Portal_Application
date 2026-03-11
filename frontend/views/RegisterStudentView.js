window.RegisterStudentView = {

template:`

<div class="auth-container d-flex justify-content-center align-items-center">

<div class="container">

<div class="row justify-content-center">

<div class="col-xl-5 col-lg-6 col-md-8 col-sm-10">

<div class="card auth-card shadow-sm">

<div class="text-center mb-4">

<h2 class="portal-title mb-1">Placement Portal</h2>
<p class="text-muted small">Register as Student</p>

</div>

<div class="mb-3">

<label class="form-label">
Name <span class="required-star">*</span>
</label>

<input
v-model="name"
class="form-control pastel-input"
placeholder="Enter your name">

</div>

<div class="mb-3">

<label class="form-label">
Email <span class="required-star">*</span>
</label>

<input
type="email"
v-model="email"
class="form-control pastel-input"
placeholder="Enter your email">

</div>

<div class="mb-3">

<label class="form-label">
Password <span class="required-star">*</span>
</label>

<input
type="password"
v-model="password"
class="form-control pastel-input"
placeholder="Create a password">

</div>

<div class="mb-3">

<label class="form-label">
Branch <span class="required-star">*</span>
</label>

<input
v-model="branch"
class="form-control pastel-input"
placeholder="e.g. Computer Science">

</div>

<div class="row">

<div class="col-md-6 mb-3">

<label class="form-label">
CGPA (0-10) <span class="required-star">*</span>
</label>

<input
type="number"
step="0.01"
min="0"
max="10"
v-model="cgpa"
class="form-control pastel-input"
placeholder="Enter CGPA">

</div>

<div class="col-md-6 mb-3">

<label class="form-label">
Graduation Year <span class="required-star">*</span>
</label>

<input
type="number"
min="2000"
max="2100"
v-model="graduation_year"
class="form-control pastel-input"
placeholder="Year">

</div>

</div>

<div class="mb-4">

<label class="form-label">Resume URL</label>

<input
v-model="resume"
class="form-control pastel-input"
placeholder="Link to resume">

</div>

<button
class="btn pastel-success w-100 mb-3"
@click="registerStudent">

Register Student

</button>

<button
class="btn pastel-outline w-100"
@click="backLogin">

Back to Login

</button>

</div>

</div>

</div>

</div>

</div>

`,

data(){

return{

name:"",
email:"",
password:"",
branch:"",
cgpa:"",
graduation_year:"",
resume:""

}

},

methods:{

validate(){

if(!this.name || !this.email || !this.password || !this.branch){
alert("Please fill required fields")
return false
}

if(this.cgpa < 0 || this.cgpa > 10){
alert("CGPA must be between 0 and 10")
return false
}

if(this.graduation_year < 2000 || this.graduation_year > 2100){
alert("Invalid graduation year")
return false
}

if(this.password.length < 6){
alert("Password must be at least 6 characters")
return false
}

if(!this.name.trim()){
alert("Name required")
return false
}

return true
},

async registerStudent(){

if(!this.validate()) return

const response = await fetch("http://127.0.0.1:5000/api/register/student",{

method:"POST",

headers:{"Content-Type":"application/json"},

body:JSON.stringify(this)

})

const data = await response.json()

alert(data.message || data.error)

if(response.ok) navigate("/login")

},

backLogin(){ navigate("/login") }

}

}