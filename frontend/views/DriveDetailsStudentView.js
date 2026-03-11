window.DriveDetailsStudentView = {

template:`

<div>

<Navbar/>

<div class="container mt-4">

<!-- Page heading -->

<h2 class="dashboard-title mb-4">Drive Details</h2>


<!-- Warning shown if student does not meet eligibility requirements -->

<div v-if="notEligible" class="alert pastel-alert-warning">
You do not meet the CGPA requirement for this drive.
</div>


<!-- Card containing placement drive information -->

<div v-if="drive" class="card pastel-card section-card p-4 shadow-sm">

<h4 class="section-title mb-3">
{{drive.job_title}}
</h4>

<p><strong>Company:</strong> {{drive.company}}</p>
<p><strong>Salary:</strong> {{drive.salary}}</p>
<p><strong>Deadline:</strong> {{drive.deadline}}</p>


<hr class="my-4">


<!-- Job description -->

<h5 class="subsection-title">Job Description</h5>
<p>{{drive.job_description}}</p>


<!-- Benefits offered -->

<h5 class="subsection-title mt-3">Benefits</h5>
<p>{{drive.benefits || "Not specified"}}</p>


<!-- Responsibilities -->

<h5 class="subsection-title mt-3">Key Responsibilities</h5>
<p>{{drive.key_responsibilities || "Not specified"}}</p>


<hr class="my-4">


<!-- Eligibility requirements -->

<h5 class="subsection-title">Eligibility</h5>

<p><strong>Minimum CGPA:</strong> {{drive.cgpa}}</p>
<p><strong>Graduation Year:</strong> {{drive.year}}</p>
<p><strong>Branch:</strong> {{drive.branch}}</p>


<!-- Action buttons -->

<div class="mt-4">

<button
class="btn btn-success me-2"
@click="apply"
:disabled="notEligible">

Apply

</button>

<button
class="btn pastel-outline-secondary"
@click="goBack">

Back

</button>

</div>

</div>

</div>

</div>

`,

components:{Navbar},

data(){

return{

drive:null,
notEligible:false

}

},

methods:{

async loadDrive(){

const selected =
JSON.parse(localStorage.getItem("selected_drive"))

if(!selected){
navigate("/student-dashboard")
return
}

const res = await fetch(
"http://127.0.0.1:5000/api/student/drive/"+selected.id,
{credentials:"include"}
)

this.drive = await res.json()

if(this.drive.cgpa && this.drive.cgpa > studentCgpa){
    this.notEligible = true
}

},

async apply(){

const response = await fetch(
"http://127.0.0.1:5000/api/student/apply/"+this.drive.id,
{
method:"POST",
credentials:"include"
}
)

const data = await response.json()

if(response.ok){

alert("Application submitted")

navigate("/student-dashboard")

}else{

alert(data.error)

}

},

goBack(){

window.history.back()

}

},

mounted(){

this.loadDrive()

}

}