window.CreateDriveView = {

template:`

<div>

<Navbar/>

<div class="container mt-4">

<!-- Page heading for creating a new placement drive -->

<h2 class="dashboard-title mb-4">Create Placement Drive</h2>


<!-- Card containing the placement drive creation form -->

<div class="card pastel-card section-card p-4 shadow-sm">

<form @submit.prevent="createDrive">

<div class="row">

<!-- Job title -->

<div class="col-md-6 mb-3">
<label class="form-label">
Job Title <span class="required-star">*</span>
</label>

<input
v-model="form.job_title"
class="form-control pastel-input"
required>
</div>


<!-- Salary -->

<div class="col-md-6 mb-3">
<label class="form-label">
Salary <span class="required-star">*</span>
</label>

<input
v-model.number="form.salary"
type="number"
class="form-control pastel-input"
required>
</div>


<!-- Job description -->

<div class="col-12 mb-3">

<label class="form-label">
Job Description <span class="required-star">*</span>
</label>

<textarea
v-model="form.job_description"
class="form-control pastel-input"
rows="3"
required>
</textarea>

</div>


<!-- Eligibility criteria -->

<div class="col-md-4 mb-3">

<label class="form-label">
Minimum CGPA <span class="required-star">*</span>
</label>

<input
v-model.number="form.eligibility_cgpa"
type="number"
step="0.01"
min="0"
max="10"
class="form-control pastel-input"
required>

</div>


<div class="col-md-4 mb-3">

<label class="form-label">
Graduation Year <span class="required-star">*</span>
</label>

<input
v-model.number="form.eligibility_year"
type="number"
class="form-control pastel-input"
required>

</div>


<div class="col-md-4 mb-3">

<label class="form-label">
Eligible Branch <span class="required-star">*</span>
</label>

<input
v-model="form.eligibility_branch"
class="form-control pastel-input"
required>

</div>


<!-- Application deadline -->

<div class="col-md-6 mb-3">

<label class="form-label">
Application Deadline <span class="required-star">*</span>
</label>

<input
v-model="form.application_deadline"
type="date"
class="form-control pastel-input"
required>

</div>


<!-- Optional benefits -->

<div class="col-12 mb-3">

<label class="form-label">Benefits</label>

<textarea
v-model="form.benefits"
class="form-control pastel-input"
placeholder="Health insurance, relocation support, bonuses..."
rows="2">
</textarea>

</div>


<!-- Optional responsibilities -->

<div class="col-12 mb-3">

<label class="form-label">Key Responsibilities</label>

<textarea
v-model="form.key_responsibilities"
class="form-control pastel-input"
placeholder="Describe the main job responsibilities..."
rows="3">
</textarea>

</div>

</div>


<!-- Form actions -->

<div class="mt-3">

<button type="submit" class="btn btn-success me-2">
Create Drive
</button>

<button
type="button"
class="btn pastel-outline-secondary"
@click="goBack">

Back to Dashboard

</button>

</div>

</form>

</div>

</div>

</div>

`,

components:{Navbar},

data(){

return{

form:{

job_title:"",
job_description:"",
salary:null,

eligibility_cgpa:null,
eligibility_year:null,
eligibility_branch:"",

application_deadline:"",

benefits:"",
key_responsibilities:""

}

}

},

methods:{


async createDrive(){

if(this.form.eligibility_cgpa > 10){

alert("CGPA must be on a 10-point scale")
return

}

const response = await fetch(
"http://127.0.0.1:5000/api/company/create-drive",
{
method:"POST",
credentials:"include",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(this.form)
}
)

const data = await response.json()

if(response.ok){

alert("Drive created successfully")

localStorage.setItem("drive_created","true")
navigate("/company-dashboard")

}else{

alert(data.error || "Failed to create drive")

}

},


goBack(){

navigate("/company-dashboard")

}

}

}