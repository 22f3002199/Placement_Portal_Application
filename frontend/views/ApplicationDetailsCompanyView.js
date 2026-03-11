window.ApplicationDetailsCompanyView = {

template:`

<div>

<Navbar/>

<div class="container mt-4">

<!-- Page heading for reviewing a student application -->

<h2 class="dashboard-title mb-4">Student Application</h2>


<!-- Card containing the full application details -->

<div v-if="application" class="card pastel-card section-card p-4 shadow-sm">

<h4 class="section-title mb-3">
{{application.student_name}}
</h4>

<p>
<strong>Email:</strong>
{{application.email}}
</p>

<p v-if="application.branch">
<strong>Branch:</strong>
{{application.branch}}
</p>

<p v-if="application.cgpa">
<strong>CGPA:</strong>
{{application.cgpa}}
</p>

<p v-if="application.graduation_year">
<strong>Graduation Year:</strong>
{{application.graduation_year}}
</p>


<!-- Skills or keywords provided by the student -->

<p v-if="application.keywords">
<strong>Skills / Keywords:</strong>
{{application.keywords}}
</p>


<!-- Personal website -->

<p v-if="application.website_url">

<strong>Website:</strong>

<a
:href="application.website_url"
target="_blank"
class="pastel-link">

{{application.website_url}}

</a>

</p>


<!-- Resume link -->

<p v-if="application.resume">

<strong>Resume:</strong>

<a
:href="application.resume"
target="_blank"
class="btn pastel-outline-primary btn-sm ms-2">

View Resume

</a>

</p>


<!-- Additional documents -->

<p v-if="application.reference_letters">
<strong>Reference Letters:</strong>
{{application.reference_letters}}
</p>

<p v-if="application.certificates_academic">
<strong>Academic Certificates:</strong>
{{application.certificates_academic}}
</p>

<p v-if="application.certificates_extracurricular">
<strong>Extracurricular Certificates:</strong>
{{application.certificates_extracurricular}}
</p>

<p v-if="application.academic_transcript">

<strong>Academic Transcript:</strong>

<a
:href="application.academic_transcript"
target="_blank"
class="btn pastel-outline-primary btn-sm ms-2">

View Transcript

</a>

</p>


<!-- Application submission date -->

<p>
<strong>Applied On:</strong>
{{application.applied_at}}
</p>


<hr class="my-4">


<!-- Current application status -->

<p>

<strong>Current Status:</strong>

<span
class="badge ms-2"
:class="{
'bg-secondary': application.status === 'applied',
'bg-warning text-dark': application.status === 'shortlisted',
'bg-success': application.status === 'selected',
'bg-danger': application.status === 'rejected'
}">
{{application.status}}
</span>

</p>


<!-- Dropdown allowing company to update application status -->

<div class="mt-4">

<label class="form-label">Update Application Status</label>

<select v-model="newStatus" class="form-control pastel-input">

<option value="applied">Applied</option>
<option value="shortlisted">Shortlisted</option>
<option value="selected">Selected</option>
<option value="rejected">Rejected</option>

</select>

</div>


<!-- Action buttons -->

<div class="mt-4">

<button
class="btn btn-success me-2"
@click="updateStatus"
:disabled="driveClosed">

Update Status

</button>

<button
class="btn pastel-outline-secondary"
@click="goBack">

Back to Dashboard

</button>

</div>

</div>


<!-- Message displayed when drive is closed -->

<div v-if="driveClosed" class="alert pastel-alert-info mt-4">
This drive is closed. Application status cannot be modified.
</div>

</div>

</div>

`,

components:{Navbar},

data(){

return{

application:null,
newStatus:"",
driveClosed:false

}

},

methods:{


async updateStatus(){

const response = await fetch(
"http://127.0.0.1:5000/api/company/update-application/"+this.application.id,
{
method:"POST",
credentials:"include",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
status:this.newStatus
})
}
)

const data = await response.json()

if(response.ok){

alert("Application updated")

navigate("/company-dashboard")

}else{

alert(data.error || "Update failed")

}

},


goBack(){

navigate("/company-dashboard")

}

},

mounted(){

const stored = localStorage.getItem("selected_application")

if(!stored){
navigate("/company-dashboard")
return
}

this.application = JSON.parse(stored)

this.newStatus = this.application.status

}

}