window.ApplicationDetailsView = {

template:`

<div>

<Navbar/>

<div class="container mt-4">

<!-- Page title for viewing a specific student application -->

<h3 class="dashboard-title mb-4">Application Details</h3>


<!-- Application information card -->

<div v-if="application" class="card pastel-card p-4 shadow-sm">

<h5 class="section-title mb-3">
{{application.student_name}}
</h5>

<p>
<strong>Email:</strong>
{{application.email}}
</p>

<p>
<strong>Status:</strong>

<span
class="badge"
:class="{
'bg-success': application.status === 'approved',
'bg-warning text-dark': application.status === 'pending',
'bg-danger': application.status === 'rejected',
'bg-secondary': application.status === 'submitted'
}">
{{application.status}}
</span>

</p>

<p>
<strong>Drive:</strong>
{{application.job_title}}
</p>

<p>
<strong>Company:</strong>
{{application.company}}
</p>

<p v-if="application.resume">

<strong>Resume:</strong>

<a
:href="application.resume"
target="_blank"
class="pastel-link">

View Resume

</a>

</p>

</div>


<!-- Fallback message if application data cannot be loaded -->

<p v-if="!application" class="text-muted">
Application data unavailable.
</p>


<!-- Navigation button back to dashboard -->

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
application:null
}
},

methods:{

goBack(){
window.history.back()
}

},

mounted(){

const stored = localStorage.getItem("selected_application")

if(!stored){
navigate("/admin-dashboard")
return
}

this.application = JSON.parse(stored)

}

}