window.DriveDetailsView = {

template:`

<div>

<Navbar/>

<div class="container mt-4">

<!-- Page heading for viewing a placement drive -->

<h3 class="dashboard-title mb-4">Placement Drive Details</h3>


<!-- Card displaying drive information -->

<div v-if="drive" class="card pastel-card p-4 shadow-sm">

<p>
<strong>Job Title:</strong>
{{drive.job_title}}
</p>

<p>
<strong>Company:</strong>
{{drive.company}}
</p>

<p>
<strong>Salary:</strong>
{{drive.salary}}
</p>

<p>

<strong>Status:</strong>

<span
class="badge ms-1"
:class="{
'bg-success': drive.status === 'approved',
'bg-warning text-dark': drive.status === 'pending',
'bg-secondary': drive.status === 'closed',
'bg-danger': drive.status === 'cancelled'
}">
{{drive.status}}
</span>

</p>

<p>
<strong>Application Deadline:</strong>
{{drive.deadline}}
</p>


<!-- Optional drive description -->

<p v-if="drive.job_description">
<strong>Description:</strong>
{{drive.job_description}}
</p>


<!-- Optional benefits offered -->

<p v-if="drive.benefits">
<strong>Benefits:</strong>
{{drive.benefits}}
</p>


<!-- Optional key responsibilities -->

<p v-if="drive.key_responsibilities">
<strong>Responsibilities:</strong>
{{drive.key_responsibilities}}
</p>


<!-- Eligibility requirements -->

<p v-if="drive.eligibility_cgpa">
<strong>Minimum CGPA:</strong>
{{drive.eligibility_cgpa}}
</p>

<p v-if="drive.eligibility_branch">
<strong>Eligible Branch:</strong>
{{drive.eligibility_branch}}
</p>

</div>


<!-- Fallback message if drive data is unavailable -->

<p v-if="!drive" class="text-muted">
Drive information unavailable.
</p>


<!-- Navigation button returning to dashboard -->

<div class="mt-4">

<button
class="btn pastel-outline-secondary"
@click="goBack">

Back to Dashboard

</button>

</div>

</div>

</div>

`,

components:{Navbar},

data(){
return{
drive:null
}
},

methods:{

goBack(){
window.history.back()
}

},

mounted(){

const stored = localStorage.getItem("selected_drive")

if(!stored){
navigate("/admin-dashboard")
return
}

this.drive = JSON.parse(stored)

}

}