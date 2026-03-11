const routes = {

"/": "LoginView",
"/login": "LoginView",

"/register-student": "RegisterStudentView",
"/register-company": "RegisterCompanyView",

"/admin-dashboard": "AdminDashboard",
"/company-details": "CompanyDetailsView",
"/drive-details": "DriveDetailsView",
"/application-details":"ApplicationDetailsView",

"/company-dashboard": "CompanyDashboard",
"/application-company-details":"ApplicationDetailsCompanyView",
"/create-drive":"CreateDriveView",

"/student-dashboard":"StudentDashboard",
"/drive-details-student":"DriveDetailsStudentView",
"/application-history":"ApplicationHistoryView",
"/company-details-student":"CompanyDetailsStudentView",
"/student-edit-profile": "StudentEditProfileView"

}

function navigate(path){
window.location.hash = path

window.dispatchEvent(new HashChangeEvent("hashchange"))
}
