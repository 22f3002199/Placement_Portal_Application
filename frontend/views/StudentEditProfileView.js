window.StudentEditProfileView = {

template:`

<div>

<Navbar/>

<div class="container mt-4">

<!-- Page heading -->

<h2 class="dashboard-title mb-4">Edit Profile</h2>


<!-- Profile edit form -->

<div class="card pastel-card section-card p-4 shadow-sm">

<form @submit.prevent="updateProfile">


<!-- Basic user information -->

<h5 class="section-title mb-3">Basic Information</h5>

<div class="mb-3">
<label class="form-label">Name</label>
<input v-model="profile.name" class="form-control pastel-input">
</div>

<div class="mb-3">
<label class="form-label">Email</label>
<input v-model="profile.email" class="form-control pastel-input" disabled>
</div>

<div class="mb-3">
<label class="form-label">Avatar URL</label>
<input v-model="profile.avatar" class="form-control pastel-input">
</div>


<hr class="my-4">


<!-- Academic details -->

<h5 class="section-title mb-3">Academic Details</h5>

<div class="mb-3">
<label class="form-label">Branch</label>
<input v-model="profile.branch" class="form-control pastel-input">
</div>

<div class="mb-3">
<label class="form-label">CGPA</label>
<input
v-model.number="profile.cgpa"
type="number"
step="0.01"
class="form-control pastel-input">
</div>

<div class="mb-3">
<label class="form-label">Graduation Year</label>
<input
v-model.number="profile.graduation_year"
type="number"
class="form-control pastel-input">
</div>


<hr class="my-4">


<!-- Professional / portfolio information -->

<h5 class="section-title mb-3">Professional Information</h5>

<div class="mb-3">
<label class="form-label">Resume URL</label>
<input v-model="profile.resume" class="form-control pastel-input">
</div>

<div class="mb-3">
<label class="form-label">Website</label>
<input v-model="profile.website_url" class="form-control pastel-input">
</div>

<div class="mb-3">
<label class="form-label">Keywords</label>
<textarea v-model="profile.keywords" class="form-control pastel-input"></textarea>
</div>


<hr class="my-4">


<!-- Supporting documents -->

<h5 class="section-title mb-3">Supporting Documents</h5>

<div class="mb-3">
<label class="form-label">Academic Certificates</label>
<textarea v-model="profile.certificates_academic" class="form-control pastel-input"></textarea>
</div>

<div class="mb-3">
<label class="form-label">Extracurricular Certificates</label>
<textarea v-model="profile.certificates_extracurricular" class="form-control pastel-input"></textarea>
</div>

<div class="mb-3">
<label class="form-label">Reference Letters</label>
<textarea v-model="profile.reference_letters" class="form-control pastel-input"></textarea>
</div>

<div class="mb-3">
<label class="form-label">Academic Transcript</label>
<input v-model="profile.academic_transcript" class="form-control pastel-input">
</div>


<!-- Form actions -->

<div class="mt-3">

<button class="btn btn-success">
Save Changes
</button>

<button
type="button"
class="btn pastel-outline-secondary ms-2"
@click="goBack">

Cancel

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

profile:{

name:"",
email:"",
avatar:"",

branch:"",
cgpa:"",
graduation_year:"",

resume:"",
website_url:"",
keywords:"",

certificates_academic:"",
certificates_extracurricular:"",
reference_letters:"",
academic_transcript:""

}

}

},

methods:{

async loadProfile(){

const res = await fetch(
"http://127.0.0.1:5000/api/student/profile",
{credentials:"include"}
)

this.profile = await res.json()

},

async updateProfile(){

console.log("Sending profile:", this.profile)

const res = await fetch(
"http://127.0.0.1:5000/api/student/profile",
{
method:"PUT",
credentials:"include",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(this.profile)
}
)

const data = await res.json()

console.log(data)

if(res.ok){
alert("Profile updated")
window.location.hash="/student-dashboard"
}else{
alert(data.error)
}

},

goBack(){
window.location.hash="/student-dashboard"
}

},

mounted(){
this.loadProfile()
}

}