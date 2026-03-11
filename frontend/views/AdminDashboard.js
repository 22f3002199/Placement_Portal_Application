window.AdminDashboard = {

template:`

<div>

<Navbar/>

<div class="container mt-4">

<h2 class="dashboard-title mb-4">Admin Dashboard</h2>

<!-- Stats overview showing platform metrics -->

<div class="row mb-5">

<div class="col-md-3 mb-3">
<div class="card pastel-stat-card text-center shadow-sm">
<div class="card-body">
<h6 class="stat-label">Total Students</h6>
<h3 class="stat-value">{{stats.total_students}}</h3>
</div>
</div>
</div>

<div class="col-md-3 mb-3">
<div class="card pastel-stat-card text-center shadow-sm">
<div class="card-body">
<h6 class="stat-label">Total Companies</h6>
<h3 class="stat-value">{{stats.total_companies}}</h3>
</div>
</div>
</div>

<div class="col-md-3 mb-3">
<div class="card pastel-stat-card text-center shadow-sm">
<div class="card-body">
<h6 class="stat-label">Pending Approvals</h6>
<h3 class="stat-value">{{stats.pending_companies}}</h3>
</div>
</div>
</div>

<div class="col-md-3 mb-3">
<div class="card pastel-stat-card text-center shadow-sm">
<div class="card-body">
<h6 class="stat-label">Placement Drives</h6>
<h3 class="stat-value">{{stats.total_drives}}</h3>
</div>
</div>
</div>

</div>


<!-- Charts section showing analytics -->

<div class="row mb-5">

<div class="col-md-4">
<div class="card pastel-card shadow-sm">
<div class="card-body">

<h5 class="section-title mb-3">User Distribution</h5>

<div style="height:260px">
<canvas ref="usersChart"></canvas>
</div>

</div>
</div>
</div>


<div class="col-md-4">
<div class="card pastel-card shadow-sm">
<div class="card-body">

<h5 class="section-title mb-3">Drive Activity</h5>

<div style="height:260px">
<canvas ref="driveChart"></canvas>
</div>

</div>
</div>
</div>


<div class="col-md-4">
<div class="card pastel-card shadow-sm">
<div class="card-body">

<h5 class="section-title mb-3">Top Hiring Companies</h5>

<div style="height:260px">
<canvas ref="leaderboardChart"></canvas>
</div>

</div>
</div>
</div>

</div>


<!-- Platform activity shows companies, drives, and applications -->

<div class="card pastel-card shadow-sm mb-5">

<div class="card-header pastel-card-header">
Platform Activity
</div>

<div class="card-body">

<ul class="nav nav-tabs pastel-tabs mb-4">

<li class="nav-item">
<a class="nav-link"
:class="{active:platformTab==='companies'}"
@click="platformTab='companies'">
All Companies
</a>
</li>

<li class="nav-item">
<a class="nav-link"
:class="{active:platformTab==='drives'}"
@click="platformTab='drives'">
Drives
</a>
</li>

<li class="nav-item">
<a class="nav-link"
:class="{active:platformTab==='applications'}"
@click="platformTab='applications'">
Applications
</a>
</li>

</ul>


<!-- Company list with search and status -->

<div v-if="platformTab==='companies'">

<input
v-model="search"
class="form-control pastel-input mb-3"
placeholder="Search company name">

<table class="table table-hover align-middle pastel-table">

<thead>
<tr>
<th>Company</th>
<th>Email</th>
<th>Status</th>
<th>View</th>
</tr>
</thead>

<tbody>

<tr v-for="c in visibleCompanies" :key="c.id">

<td>

<span v-if="c.status=='rejected'">
{{c.company_name}}
</span>

<a v-else href="#" @click.prevent="openCompany(c)">
{{c.company_name}}
</a>

</td>

<td>{{c.email}}</td>

<td>

<span v-if="c.status=='approved'" class="badge bg-success">
Approved
</span>

<span v-if="c.status=='pending'" class="badge bg-warning text-dark">
Pending
</span>

<span v-if="c.status=='blacklisted'" class="badge bg-danger">
Blacklisted
</span>

</td>

<td>

<button
class="btn pastel-outline-primary btn-sm"
@click="viewCompanyDetails(c)">
Details →
</button>

</td>

</tr>

</tbody>

</table>

<div v-if="filteredCompanies.length > 3">

<button
class="btn pastel-outline-secondary btn-sm"
@click="showAllCompanies=!showAllCompanies">

{{showAllCompanies ? "Show Less" : "Show All"}}

</button>

</div>

</div>


<!-- Placement drives table -->

<div v-if="platformTab==='drives'">

<div class="d-flex justify-content-between align-items-center mb-3">

<h5 class="section-title">
Placement Drives — {{ selectedCompany && selectedCompany.company_name ? selectedCompany.company_name : "Recent Drives" }}
</h5>

<button
v-if="selectedCompany && selectedCompany.company_name !== 'Recent Drives'"
class="btn pastel-outline-secondary btn-sm"
@click="showRecentDrives">

Recent Drives

</button>

</div>

<p v-if="!companyDrives.length" class="text-muted">
No placement drives available.
</p>

<table
v-if="companyDrives.length"
class="table table-hover align-middle pastel-table">

<thead>
<tr>
<th>Job Title</th>
<th>Salary</th>
<th>Status</th>
<th>Deadline</th>
<th>Details</th>
</tr>
</thead>

<tbody>

<tr v-for="d in visibleDrives" :key="d.id">

<td @click="openDrive(d)" style="cursor:pointer">
{{d.job_title}}
</td>

<td>{{d.salary}}</td>

<td>

<span class="badge"
:class="{
'bg-success':d.status=='approved',
'bg-warning text-dark':d.status=='pending',
'bg-secondary':d.status=='closed',
'bg-danger':d.status=='cancelled'
}">
{{d.status}}
</span>

</td>

<td>{{d.deadline}}</td>

<td>

<button
class="btn pastel-outline-primary btn-sm"
@click="viewDriveDetails(d)">
Details →
</button>

</td>

</tr>

</tbody>

</table>

<div v-if="companyDrives.length > 3">

<button
class="btn pastel-outline-secondary btn-sm"
@click="showAllDrives=!showAllDrives">

{{showAllDrives ? "Show Less" : "Show All"}}

</button>

</div>

</div>


<!-- Applications table -->

<div v-if="platformTab==='applications'">

<div class="d-flex justify-content-between align-items-center mb-3">

<h5 class="section-title">
Student Applications — {{selectedDriveName || "Recent Applications"}}
</h5>

<button
v-if="selectedDriveName !== 'Recent Applications'"
class="btn pastel-outline-secondary btn-sm"
@click="showRecentApplications">

Recent Applications

</button>

</div>

<p v-if="!applications.length" class="text-muted">
No student applications available.
</p>

<table
v-if="applications.length"
class="table table-hover align-middle pastel-table">

<thead>
<tr>
<th>Student</th>
<th>Email</th>
<th>Status</th>
<th>View</th>
</tr>
</thead>

<tbody>

<tr v-for="a in visibleApplications" :key="a.id">

<td>{{a.student_name}}</td>
<td>{{a.email}}</td>
<td>{{a.status}}</td>

<td>

<button
class="btn pastel-outline-primary btn-sm"
@click="viewApplicationDetails(a)">
View →
</button>

</td>

</tr>

</tbody>

</table>

<div v-if="applications.length > 3">

<button
class="btn pastel-outline-secondary btn-sm"
@click="showAllApplications=!showAllApplications">

{{showAllApplications ? "Show Less" : "Show All"}}

</button>

</div>

</div>

</div>


</div>

<!-- Moderation section for approving or rejecting company registrations -->

<div class="card pastel-card shadow-sm mb-5">

<div class="card-header pastel-card-header">
Moderation
</div>

<div class="card-body">

<ul class="nav nav-tabs pastel-tabs mb-4">

<li class="nav-item">
<a class="nav-link"
:class="{active:moderationTab==='pending'}"
@click="moderationTab='pending'">
Pending Companies
</a>
</li>

<li class="nav-item">
<a class="nav-link"
:class="{active:moderationTab==='rejected'}"
@click="moderationTab='rejected'">
Rejected Companies
</a>
</li>

</ul>


<!-- Pending companies awaiting approval -->

<div v-if="moderationTab==='pending'">

<p v-if="!companies.length" class="text-muted">
No pending company applications
</p>

<table v-if="companies.length"
class="table table-hover align-middle pastel-table">

<thead>
<tr>
<th>Company</th>
<th>Email</th>
<th>Website</th>
<th>Headquarters</th>
<th>Employees</th>
<th>Actions</th>
</tr>
</thead>

<tbody>

<tr v-for="c in visiblePendingCompanies" :key="c.id">

<td>{{c.company_name}}</td>
<td>{{c.email}}</td>
<td>{{c.website}}</td>
<td>{{c.headquarters}}</td>
<td>{{c.employees}}</td>

<td>

<button
class="btn btn-success btn-sm me-2"
@click="approveCompany(c.id)">
Approve
</button>

<button
class="btn btn-danger btn-sm"
@click="rejectCompany(c.id)">
Reject
</button>

</td>

</tr>

</tbody>

</table>

<div v-if="companies.length > 3">

<button
class="btn pastel-outline-secondary btn-sm"
@click="showAllPending=!showAllPending">

{{showAllPending ? "Show Less" : "Show All"}}

</button>

</div>

</div>


<!-- Companies that were rejected -->

<div v-if="moderationTab==='rejected'">

<p v-if="!rejectedCompanies.length" class="text-muted">
No rejected companies
</p>

<table
v-if="rejectedCompanies.length"
class="table table-hover align-middle pastel-table">

<thead>
<tr>
<th>Name</th>
<th>Email</th>
<th>Website</th>
<th>Headquarters</th>
<th>Employees</th>
</tr>
</thead>

<tbody>

<tr v-for="c in rejectedCompanies" :key="c.id">

<td>{{c.name}}</td>
<td>{{c.email}}</td>
<td>{{c.website}}</td>
<td>{{c.headquarters}}</td>
<td>{{c.employees}}</td>

</tr>

</tbody>

</table>

</div>

</div>

</div>

<!-- Security section for blacklisting or reactivating users -->

<div class="card pastel-card shadow-sm mb-5">

<div class="card-header pastel-card-header-danger">
Security — Blocklist
</div>

<div class="card-body">

<input
v-model="blacklistSearch"
class="form-control pastel-input mb-3"
placeholder="Search students or companies">

<table class="table table-hover align-middle pastel-table">

<thead>
<tr>
<th>Name</th>
<th>Email</th>
<th>Role</th>
<th>Status</th>
<th>Action</th>
</tr>
</thead>

<tbody>

<tr v-for="u in blacklistResults" :key="u.id">

<td>{{u.name}}</td>
<td>{{u.email}}</td>
<td>{{u.role}}</td>

<td>

<span v-if="u.active" class="badge bg-success">
Active
</span>

<span v-else class="badge bg-danger">
Blacklisted
</span>

</td>

<td>

<button
v-if="u.active"
class="btn btn-danger btn-sm"
@click="confirmBlacklist(u)">
Blacklist
</button>

<button
v-else
class="btn btn-success btn-sm"
@click="reactivateUser(u.id)">
Reactivate
</button>

</td>

</tr>

</tbody>
</table>
</div>
</div>

`,

components:{Navbar},

data(){
return{

stats:{
total_students:0,
total_companies:0,
pending_companies:0,
total_drives:0
},

platformTab:"companies",
moderationTab:"pending",

drives:[],
companies:[],
allCompanies:[],
rejectedCompanies:[],

companyDrives:[],
selectedCompany:null,

applications:[],
selectedDrive:null,
selectedDriveName:"Recent Applications",

search:"",
blacklistSearch:"",
blacklistResults:[],

showAllDrives:false,
showAllCompanies:false,
showAllPending:false,
showAllApplications:false,

usersChart: null,
leaderboardChart: null,
driveChart: null,
analytics: null

}
},

watch:{

blacklistSearch(){
this.searchUsers()
}

},

computed:{

filteredCompanies(){
return this.allCompanies.filter(c =>
c.company_name.toLowerCase().includes(this.search.toLowerCase())
)
},

visiblePendingCompanies(){
return this.showAllPending
? this.companies
: this.companies.slice(0,3)
},

visibleDrives(){
return this.showAllDrives
? this.companyDrives
: this.companyDrives.slice(0,3)
},

visibleCompanies(){
const list=this.filteredCompanies
return this.showAllCompanies?list:list.slice(0,3)
},

visibleApplications(){
return this.showAllApplications
? this.applications
: this.applications.slice(0,3)
}

},

methods:{

async loadSummary(){
const response=await fetch(
"http://127.0.0.1:5000/api/admin/summary",
{credentials:"include"}
)
this.stats=await response.json()
},

async loadCompanies(){
const response=await fetch(
"http://127.0.0.1:5000/api/admin/pending-companies",
{credentials:"include"}
)
const data=await response.json()
this.companies=data.companies
},

async loadAllCompanies(){
const response=await fetch(
"http://127.0.0.1:5000/api/admin/companies",
{credentials:"include"}
)
const data=await response.json()
this.allCompanies=data.companies
},

async loadRejectedCompanies(){
const response=await fetch(
"http://127.0.0.1:5000/api/admin/rejected-companies",
{credentials:"include"}
)
const data=await response.json()
this.rejectedCompanies=data.companies
},

renderCharts(){

this.$nextTick(()=>{

this.createUsersChart()
this.createLeaderboardChart()
this.createDriveChart()

})

},

async refreshDashboard(){

await Promise.all([
this.loadSummary(),
this.loadCompanies(),
this.loadAllCompanies(),
this.loadRejectedCompanies()
])
},

async approveCompany(id){
await fetch(
"http://127.0.0.1:5000/api/admin/approve-company/"+id,
{method:"POST",credentials:"include"}
)
this.refreshDashboard()
},

async rejectCompany(id){
await fetch(
"http://127.0.0.1:5000/api/admin/reject-company/"+id,
{method:"POST",credentials:"include"}
)
this.refreshDashboard()
},

async openCompany(company){
this.selectedCompany=company
const response=await fetch(
"http://127.0.0.1:5000/api/admin/company-drives/"+company.id,
{credentials:"include"}
)
const data=await response.json()
this.companyDrives=data.drives||[]
this.platformTab="drives"
},

viewCompanyDetails(company){
localStorage.setItem("selected_company",JSON.stringify(company))
navigate("/company-details")
},

async loadRecentDrives(){
const response=await fetch(
"http://127.0.0.1:5000/api/admin/recent-drives",
{credentials:"include"}
)
const data=await response.json()
this.companyDrives=data.drives||[]
this.selectedCompany={company_name:"Recent Drives"}
},

viewDriveDetails(d){
localStorage.setItem("selected_drive",JSON.stringify(d))
navigate("/drive-details")
},

async loadRecentApplications(){
const response=await fetch(
"http://127.0.0.1:5000/api/admin/recent-applications",
{credentials:"include"}
)
const data=await response.json()
this.applications=data.applications||[]
this.selectedDrive=null
this.selectedDriveName="Recent Applications"

},

async openDrive(drive){
this.selectedDrive=drive
this.selectedDriveName=drive.job_title

const response=await fetch(
"http://127.0.0.1:5000/api/admin/drive-applications/"+drive.id,
{credentials:"include"}
)

const data=await response.json()
this.applications=data.applications||[]
this.platformTab="applications"
},

viewApplicationDetails(app){
localStorage.setItem("selected_application",JSON.stringify(app))
navigate("/application-details")
},

async searchUsers(){

if(!this.blacklistSearch){
this.blacklistResults=[]
return
}

const response=await fetch(
"http://127.0.0.1:5000/api/admin/search-users?q="+this.blacklistSearch,
{credentials:"include"}
)

const data=await response.json()
this.blacklistResults=data.users

},

confirmBlacklist(user){

if(!confirm("Are you sure you want to blacklist "+user.name+"?")) return
this.blacklistUser(user.id)

},

async blacklistUser(id){

await fetch(
"http://127.0.0.1:5000/api/admin/blacklist-user/"+id,
{method:"POST",credentials:"include"}
)

this.searchUsers()
await this.refreshDashboard()

},

async reactivateUser(id){

await fetch(
"http://127.0.0.1:5000/api/admin/reactivate-user/"+id,
{method:"POST",credentials:"include"}
)

this.searchUsers()
await this.refreshDashboard()

},

showRecentDrives(){

this.selectedCompany={company_name:"Recent Drives"}
this.loadRecentDrives()
this.loadRecentApplications()
this.platformTab="drives"

},

showRecentApplications(){

this.selectedDrive=null
this.selectedDriveName="Recent Applications"
this.loadRecentApplications()
this.platformTab="applications"

},

async loadAnalytics(){

const response = await fetch(
"http://127.0.0.1:5000/api/admin/analytics",
{credentials:"include"}
)

this.analytics = await response.json()

},

createUsersChart(){

const canvas = this.$refs.usersChart
if(!canvas || !this.analytics) return

if(this.usersChart) this.usersChart.destroy()

const students = this.analytics.users.students
const companies = this.analytics.users.companies

this.usersChart = new Chart(canvas,{

type:"bar",

data:{
labels:["Students","Companies"],

datasets:[

{
label:"Active",
data:[
students.active,
companies.active
],
backgroundColor:"#1cc88a"
},

{
label:"Blocked",
data:[
students.blocked,
companies.blocked
],
backgroundColor:"#e74a3b"
},

{
label:"Pending",
data:[
0,
companies.pending
],
backgroundColor:"#f6c23e"
},

{
label:"Rejected",
data:[
0,
companies.rejected
],
backgroundColor:"#858796"
}

]

},

options:{
responsive:true,
maintainAspectRatio:false,

plugins:{
legend:{position:"bottom"}
},

scales:{
x:{stacked:true},
y:{stacked:true,beginAtZero:true}
}

}

})

},

createLeaderboardChart(){

const canvas = this.$refs.leaderboardChart
if(!canvas || !this.analytics) return

if(this.leaderboardChart) this.leaderboardChart.destroy()

const companies = this.analytics.leaderboard.map(c => c.company)
const hires = this.analytics.leaderboard.map(c => c.hires)

this.leaderboardChart = new Chart(canvas,{

type:"bar",

data:{
labels:companies,

datasets:[{
label:"Students Hired",
data:hires,
backgroundColor:"#1cc88a"
}]
},

options:{
responsive:true,
maintainAspectRatio:false,

indexAxis:"y",

plugins:{
legend:{display:false}
},

scales:{
x:{beginAtZero:true}
}

}

})

},

createDriveChart(){

const canvas = this.$refs.driveChart
if(!canvas || !this.analytics) return

if(this.driveChart) this.driveChart.destroy()

const drives = this.analytics.drives

this.driveChart = new Chart(canvas,{

type:"doughnut",

data:{
labels:["Active Drives","Inactive Drives"],

datasets:[{
data:[
drives.active,
drives.inactive
],
backgroundColor:[
"#4e73df",
"#858796"
]
}]
},

options:{
responsive:true,
maintainAspectRatio:false,

plugins:{

legend:{position:"bottom"},

tooltip:{
callbacks:{
label:(ctx)=>{

if(ctx.label==="Active Drives"){
return "Active Drives ("+drives.active_applications+" applicants)"
}

return "Inactive Drives ("+drives.inactive_applications+" applicants)"

}
}
}

}

}

})

}

},

beforeUnmount(){

if(this.usersChart) this.usersChart.destroy()
if(this.leaderboardChart) this.leaderboardChart.destroy()
if(this.driveChart) this.driveChart.destroy()

},

mounted(){

Promise.all([
this.refreshDashboard(),
this.loadRecentDrives(),
this.loadRecentApplications(),
this.loadAnalytics()
]).then(()=>{

this.renderCharts()

})

}

}