window.CompanyDashboard = {

template:`

<div>

<Navbar/>

<div class="container mt-4">

<!-- Page title -->

<h2 class="dashboard-title mb-4">Company Dashboard</h2>


<!-- Account approval / moderation status -->

<div v-if="locked" class="alert pastel-alert-warning">

<h4 class="mb-2">Account Status</h4>

<p v-if="lockMessage=='pending'">
Your registration is awaiting admin approval.
</p>

<p v-if="lockMessage=='rejected'">
Your registration was rejected.
</p>

<p v-if="lockMessage=='blacklisted'">
Your account has been blacklisted.
</p>

</div>


<div v-if="!locked">


<!-- Section: create placement drive -->

<div class="card pastel-card section-card shadow-sm mb-4">

<div class="card-body">

<button
class="btn pastel-primary"
@click="navigateCreateDrive">

Create Placement Drive

</button>

</div>

</div>



<!-- Section: company placement drives -->

<div class="card pastel-card section-card shadow-sm mb-4">

<div class="card-body">

<h4 class="section-title mb-3">Your Placement Drives</h4>

<table class="table table-hover align-middle pastel-table">

<thead>
<tr>
<th>Job Title</th>
<th>Salary</th>
<th>Status</th>
<th>Applications</th>
<th>Deadline</th>
<th>Close</th>
</tr>
</thead>

<tbody>

<tr v-for="d in visibleDrives" :key="d.id">

<td>{{d.job_title}}</td>

<td>{{d.salary}}</td>

<td>

<span
class="badge"
:class="{
'bg-success': d.status === 'approved',
'bg-warning text-dark': d.status === 'pending',
'bg-secondary': d.status === 'closed',
'bg-danger': d.status === 'cancelled'
}">
{{d.status}}
</span>

</td>

<td>

<button
class="btn pastel-outline-primary btn-sm"
@click="openDrive(d)">

View Applications

</button>

</td>

<td>{{d.deadline}}</td>

<td>

<button
v-if="d.status=='approved'"
class="btn btn-danger btn-sm"
@click="closeDrive(d.id)">

Close

</button>

</td>

</tr>

</tbody>

</table>

<button
v-if="drives.length>5"
class="btn pastel-outline-secondary btn-sm"
@click="showAllDrives=!showAllDrives">

{{showAllDrives ? "Show Less":"Show All"}}

</button>

</div>

</div>



<!-- Section: applications for selected drive -->

<div class="card pastel-card section-card shadow-sm">

<div class="card-body">

<h4 class="section-title mb-3">
Applications — {{selectedDriveName}}
</h4>

<table class="table table-hover align-middle pastel-table">

<thead>
<tr>
<th>Student</th>
<th>Email</th>
<th>Status</th>
</tr>
</thead>

<tbody>

<tr v-for="a in visibleApplications" :key="a.id">

<td>

<a
href=""
class="pastel-link"
@click.prevent="viewApplication(a)">

{{a.student}}

</a>

</td>

<td>{{a.email}}</td>

<td>

<span
class="badge"
:class="{
'bg-success': a.status === 'approved',
'bg-warning text-dark': a.status === 'pending',
'bg-danger': a.status === 'rejected',
'bg-secondary': a.status === 'submitted',
'bg-secondary': a.status === 'shortlisted'
}">
{{a.status}}
</span>

</td>

</tr>

</tbody>

</table>

<button
v-if="applications.length>5"
class="btn pastel-outline-secondary btn-sm"
@click="showAllApplications=!showAllApplications">

{{showAllApplications ? "Show Less":"Show All"}}

</button>

</div>

</div>


</div>

</div>

</div>

`,

components:{Navbar},

data(){

return{

locked:false,
lockMessage:"",

drives:[],
applications:[],

selectedDriveName:"Recent Applications",

showAllDrives:false,
showAllApplications:false

}

},

computed:{

visibleDrives(){

if(this.showAllDrives) return this.drives

return this.drives.slice(0,5)

},

visibleApplications(){

if(this.showAllApplications) return this.applications

return this.applications.slice(0,5)

}

},

methods:{


navigateCreateDrive(){

navigate("/create-drive")

},


async checkCompanyStatus(){

const res = await fetch(
"http://127.0.0.1:5000/api/company/status",
{credentials:"include"}
)

const data = await res.json()

if(data.status!="approved"){

this.locked=true
this.lockMessage=data.status

}

},


async loadDrives(){

const res = await fetch(
"http://127.0.0.1:5000/api/company/drives",
{credentials:"include"}
)

const data = await res.json()

this.drives = data.drives

// auto-load applications of most recent drive

if(this.drives.length){
    this.openDrive(this.drives[0])
}

},

refreshDashboard(){

this.loadDrives()

this.applications = []

this.selectedDriveName = "Recent Applications"

},

async closeDrive(id){

if(!confirm("Close this drive?"))
return

await fetch(
"http://127.0.0.1:5000/api/company/close-drive/"+id,
{
method:"POST",
credentials:"include"
}
)

this.refreshDashboard()

},


async openDrive(d){

const res = await fetch(
"http://127.0.0.1:5000/api/company/drive-applications/"+d.id,
{credentials:"include"}
)

const data = await res.json()

this.applications=data.applications

this.selectedDriveName=d.job_title

},


viewApplication(app){

localStorage.setItem(
"selected_application",
JSON.stringify(app)
)

navigate("/application-company-details")

}

},

mounted(){

this.checkCompanyStatus()

this.loadDrives()

if(localStorage.getItem("drive_created")){

this.refreshDashboard()

localStorage.removeItem("drive_created")

}

}

}