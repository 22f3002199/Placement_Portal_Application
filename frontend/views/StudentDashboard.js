window.StudentDashboard = {

template:`

<div>

<Navbar/>

<div class="container mt-4">

<!-- Page heading -->

<h2 class="dashboard-title mb-4">Student Dashboard</h2>


<!-- CSV export download link -->

<div v-if="exportFile" class="mb-4">

<a
:href="'http://127.0.0.1:5000/api/student/download/' + exportFile"
class="btn btn-success">

Download CSV

</a>

</div>


<!-- Section: Organizations -->

<div class="card pastel-card section-card shadow-sm mb-4">

<div class="card-body">

<h4 class="section-title mb-3">Organizations</h4>

<table class="table table-hover align-middle pastel-table">

<thead>
<tr>
<th>Company</th>
<th>Headquarters</th>
<th>View</th>
</tr>
</thead>

<tbody>

<tr v-for="c in companies" :key="c.id">

<td>{{c.name}}</td>
<td>{{c.headquarters}}</td>

<td>

<button
class="btn pastel-outline-primary btn-sm"
@click="viewCompany(c)">

View Details

</button>

</td>

</tr>

</tbody>

</table>

</div>

</div>


<!-- Section: Available placement drives -->

<div class="card pastel-card section-card shadow-sm mb-4">

<div class="card-body">

<h4 class="section-title mb-3">Available Placement Drives</h4>


<!-- Search controls -->

<div class="row mb-3">

<div class="col-md-3">

<select v-model="searchType" class="form-select pastel-input">

<option value="company">Company</option>
<option value="job">Job Title</option>
<option value="salary">Minimum Salary</option>
<option value="eligible">Eligibility</option>

</select>

</div>

<div class="col-md-9">

<input
v-model="search"
class="form-control pastel-input"
placeholder="Enter search value">

</div>

</div>


<!-- Drives table -->

<table class="table table-hover align-middle pastel-table">

<thead>
<tr>
<th>Company</th>
<th>Job Title</th>
<th>Salary</th>
<th>Deadline</th>
<th>Eligibility</th>
<th>View</th>
</tr>
</thead>


<tbody v-if="visibleDrives.length">

<tr v-for="d in visibleDrives" :key="d.id">

<td>{{d.company}}</td>
<td>{{d.job_title}}</td>
<td>{{d.salary}}</td>
<td>{{d.deadline}}</td>

<td>

<span v-if="d.eligible" class="badge bg-success">
Eligible
</span>

<span v-else class="badge bg-secondary">
Not Eligible
</span>

</td>

<td>

<button
class="btn pastel-outline-primary btn-sm"
@click="viewDrive(d)">

View

</button>

</td>

</tr>

</tbody>


<tbody v-else>

<tr>
<td colspan="6" class="text-center text-muted">
No drives found
</td>
</tr>

</tbody>

</table>


<!-- Toggle full list of drives -->

<button
v-if="filteredDrives.length > 5"
class="btn pastel-outline-secondary btn-sm"
@click="showAllDrives = !showAllDrives">

{{showAllDrives ? "Show Less" : "Show All"}}

</button>

</div>

</div>



<!-- Section: My applications -->

<div class="card pastel-card section-card shadow-sm">

<div class="card-body">

<button
class="btn pastel-outline-primary mb-3"
@click="exportApplications">

Export Applications CSV

</button>

<h4 class="section-title mb-3">My Applications</h4>

<table class="table table-hover align-middle pastel-table">

<thead>
<tr>
<th>Company</th>
<th>Job Title</th>
<th>Status</th>
</tr>
</thead>


<tbody v-if="visibleApplications.length">

<tr v-for="a in visibleApplications" :key="a.id">

<td>{{a.company}}</td>
<td>{{a.job_title}}</td>

<td>

<span
class="badge"
:class="{
'bg-secondary': a.status === 'applied',
'bg-warning text-dark': a.status === 'shortlisted',
'bg-success': a.status === 'selected',
'bg-danger': a.status === 'rejected'
}">
{{a.status}}
</span>

</td>

</tr>

</tbody>


<tbody v-else>

<tr>
<td colspan="3" class="text-center text-muted">
You have not applied to any drives yet
</td>
</tr>

</tbody>

</table>


<!-- Toggle applications -->

<button
v-if="applications.length > 5"
class="btn pastel-outline-secondary btn-sm"
@click="showAllApplications = !showAllApplications">

{{showAllApplications ? "Show Less" : "Show All"}}

</button>

</div>

</div>


</div>

</div>

`,

components:{Navbar},

data(){

return{

drives:[],
applications:[],
companies:[],

search:"",
searchType:"company",

showAllDrives:false,
showAllApplications:false,

exportTaskId:null,
exportFile:null

}

},


computed:{

filteredDrives(){

if(!this.search)
return this.drives

const term = this.search.toLowerCase()

return this.drives.filter(d => {

if(this.searchType === "company"){
return d.company.toLowerCase().includes(term)
}

if(this.searchType === "job"){
return d.job_title.toLowerCase().includes(term)
}

if(this.searchType === "salary"){

const minSalary = Number(term)

if(isNaN(minSalary)) return true

return d.salary >= minSalary

}

if(this.searchType === "eligible"){

if(term === "eligible" || term === "yes") return d.eligible
if(term === "not eligible" || term === "no") return !d.eligible

return true

}

return true

})

},


visibleDrives(){

if(this.showAllDrives)
return this.filteredDrives

return this.filteredDrives.slice(0,5)

},


visibleApplications(){

if(this.showAllApplications)
return this.applications

return this.applications.slice(0,5)

}

},


methods:{


async loadDrives(){

const res = await fetch(
"http://127.0.0.1:5000/api/student/drives",
{credentials:"include"}
)

const data = await res.json()

this.drives = data.drives

},


async loadApplications(){

const res = await fetch(
"http://127.0.0.1:5000/api/student/applications",
{credentials:"include"}
)

const data = await res.json()

this.applications = data.applications

},


viewDrive(d){

localStorage.setItem(
"selected_drive",
JSON.stringify(d)
)

window.location.hash = "/drive-details-student"

},

async loadCompanies(){

const res = await fetch(
"http://127.0.0.1:5000/api/student/companies",
{credentials:"include"}
)

const data = await res.json()

this.companies = data.companies

},

viewCompany(c){

localStorage.setItem(
"selected_company",
JSON.stringify(c)
)

window.location.hash="/company-details-student"

},


async exportApplications(){

const res = await fetch(
"http://127.0.0.1:5000/api/student/export",
{
method:"POST",
credentials:"include"
}
)

const data = await res.json()

this.exportTaskId = data.task_id

alert("Export job started")

this.checkExportStatus()

},

async checkExportStatus(){

if(!this.exportTaskId) return

const interval = setInterval(async () => {

const res = await fetch(
"http://127.0.0.1:5000/api/student/export-status/" + this.exportTaskId,
{credentials:"include"}
)

const data = await res.json()

if(data.status === "completed"){

clearInterval(interval)

this.exportFile = data.file

alert("Export finished!")

}

},2000)

}

},


mounted(){

this.loadDrives()
this.loadApplications()
this.loadCompanies()

}

}