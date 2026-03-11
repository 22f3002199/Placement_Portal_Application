window.RegisterCompanyView = {

template:`

<div class="auth-container d-flex justify-content-center align-items-center">

<div class="container">

<div class="row justify-content-center">

<div class="col-xl-5 col-lg-6 col-md-8 col-sm-10">

<div class="card auth-card shadow-sm">

<div class="text-center mb-4">

<h2 class="portal-title mb-1">Placement Portal</h2>
<p class="text-muted small">Register your company</p>

</div>

<div class="mb-3">

<label class="form-label">
Company Name <span class="required-star">*</span>
</label>

<input
v-model="name"
class="form-control pastel-input"
placeholder="Enter company name">

</div>

<div class="mb-3">

<label class="form-label">
Email <span class="required-star">*</span>
</label>

<input
type="email"
v-model="email"
class="form-control pastel-input"
placeholder="Enter company email">

</div>

<div class="mb-3">

<label class="form-label">
Password <span class="required-star">*</span>
</label>

<input
type="password"
v-model="password"
class="form-control pastel-input"
placeholder="Create password">

</div>

<div class="mb-3">

<label class="form-label">
Company Description <span class="required-star">*</span>
</label>

<textarea
v-model="description"
class="form-control pastel-input"
rows="3"
placeholder="Brief description of the company">
</textarea>

</div>

<div class="row">

<div class="col-md-6 mb-3">

<label class="form-label">HR Contact</label>

<input
v-model="hr_contact"
class="form-control pastel-input"
placeholder="HR contact">

</div>

<div class="col-md-6 mb-3">

<label class="form-label">Website</label>

<input
v-model="website"
class="form-control pastel-input"
placeholder="https://company.com">

</div>

</div>

<div class="row">

<div class="col-md-6 mb-3">

<label class="form-label">Headquarters</label>

<input
v-model="headquarters"
class="form-control pastel-input"
placeholder="City / Country">

</div>

<div class="col-md-6 mb-4">

<label class="form-label">Employees</label>

<input
type="number"
v-model="number_of_employees"
class="form-control pastel-input"
placeholder="Company size">

</div>

</div>

<button
class="btn pastel-success w-100 mb-3"
@click="registerCompany">

Register Company

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
hr_contact:"",
website:"",
headquarters:"",
number_of_employees:"",
description: ""

}

},

methods:{

async registerCompany(){

if(!this.name || !this.email || !this.password || !this.description){
alert("Fill required fields")

if(this.password.length < 6){
alert("Password must be at least 6 characters")
return false
}

if(!this.name.trim()){
alert("Name required")
return false
}

try {
new URL(this.website)
} catch {
alert("Invalid website URL")
return
}

return

}

const response = await fetch("http://127.0.0.1:5000/api/register/company",{

method:"POST",

headers:{"Content-Type":"application/json"},

body:JSON.stringify(this)

})

const data = await response.json()

alert(data.message || data.error)

if(response.ok) navigate("/login")

},

backLogin(){

navigate("/login")

}

}

}