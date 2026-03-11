window.ApplicationHistoryView = {

template:`

<div>

<Navbar/>

<div class="container mt-4">

<!-- Page heading showing student's submitted applications -->

<h2 class="dashboard-title mb-4">My Applications</h2>


<!-- Section containing applications table -->

<div class="card pastel-card section-card shadow-sm">

<div class="card-body">

<table class="table table-hover align-middle pastel-table">

<thead>
<tr>
<th>Company</th>
<th>Job Title</th>
<th>Status</th>
<th>Details</th>
</tr>
</thead>

<tbody>

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

<td>

<button
class="btn pastel-outline-primary btn-sm"
@click="viewApplication(a)">

View

</button>

</td>

</tr>

</tbody>

</table>


<!-- Toggle button for showing all applications -->

<button
v-if="applications.length>5"
class="btn pastel-outline-secondary btn-sm mt-2"
@click="showAll=!showAll">

{{showAll ? "Show Less":"Show All"}}

</button>

</div>

</div>

</div>

</div>

`,

components:{Navbar},

data(){

return{

applications:[],
showAll:false

}

},

computed:{

visibleApplications(){

if(this.showAll)
return this.applications

return this.applications.slice(0,5)

}

},

methods:{

async loadApplications(){

const res = await fetch(
"http://127.0.0.1:5000/api/student/applications",
{credentials:"include"}
)

const data = await res.json()

this.applications = data.applications

},

viewApplication(app){

alert(
app.company + " — " + app.job_title +
"\nStatus: " + app.status
)

}

},

mounted(){

this.loadApplications()

}

}