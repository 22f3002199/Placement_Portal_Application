window.CompanyDetailsView = {

template:`

<div>

<Navbar/>

<div class="container mt-4">

<!-- Page heading for viewing company information -->

<h3 class="dashboard-title mb-4">Company Details</h3>


<!-- Card displaying company information -->

<div v-if="company" class="card pastel-card p-4 shadow-sm">

<p>
<strong>Name:</strong>
{{company.company_name}}
</p>

<p v-if="company.email">
<strong>Email:</strong>
{{company.email}}
</p>

<p v-if="company.website">
<strong>Website:</strong>

<a
:href="company.website"
target="_blank"
class="pastel-link">

{{company.website}}

</a>

</p>

<p v-if="company.headquarters">
<strong>Headquarters:</strong>
{{company.headquarters}}
</p>

<p v-if="company.employees">
<strong>Employees:</strong>
{{company.employees}}
</p>

<p v-if="company.description">
<strong>Description:</strong>
{{company.description}}
</p>

<p v-if="company.hr_contact">
<strong>HR Contact:</strong>
{{company.hr_contact}}
</p>

<p v-if="company.status">

<strong>Status:</strong>

<span
class="badge ms-1"
:class="{
'bg-success': company.status === 'approved',
'bg-warning text-dark': company.status === 'pending',
'bg-danger': company.status === 'rejected',
'bg-secondary': company.status === 'inactive'
}">
{{company.status}}
</span>

</p>

</div>


<!-- Fallback message if company data cannot be loaded -->

<p v-if="!company" class="text-muted">
Company information unavailable.
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
company:null
}
},

methods:{

goBack(){
navigate("/admin-dashboard")
}

},

mounted(){

const stored = localStorage.getItem("selected_company")

if(!stored){
navigate("/admin-dashboard")
return
}

this.company = JSON.parse(stored)

}

}