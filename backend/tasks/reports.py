from datetime import datetime
from sqlalchemy import func

from backend.database import SessionLocal
from backend.models import PlacementDrive, Application, Company
from backend.celery_worker import celery


@celery.task
def generate_monthly_report():

    db = SessionLocal()

    total_drives = db.query(PlacementDrive).count()

    total_applications = db.query(Application).count()

    selected_students = db.query(Application).filter(
        Application.status == "selected"
    ).count()

    shortlisted = db.query(Application).filter(
        Application.status == "shortlisted"
    ).count()

    rejected = db.query(Application).filter(
        Application.status == "rejected"
    ).count()

    interview = db.query(Application).filter(
        Application.status == "interview"
    ).count()

    applied = db.query(Application).filter(
        Application.status == "applied"
    ).count()

    selection_rate = 0
    if total_applications > 0:
        selection_rate = round((selected_students / total_applications) * 100, 2)

    # Top companies by applications
    top_companies = (
        db.query(
            Company.id,
            Company.user_id,
            func.count(Application.id).label("applications")
        )
        .join(PlacementDrive, PlacementDrive.company_id == Company.id)
        .join(Application, Application.drive_id == PlacementDrive.id)
        .group_by(Company.id)
        .order_by(func.count(Application.id).desc())
        .limit(5)
        .all()
    )

    # Recent drives
    recent_drives = (
        db.query(PlacementDrive)
        .order_by(PlacementDrive.created_at.desc())
        .limit(5)
        .all()
    )

    report_html = f"""
<!DOCTYPE html>
<html>

<head>

<link rel="stylesheet"
href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">

</head>

<body class="bg-light">

<div class="container mt-5">

<h2 class="mb-4 text-center">
Monthly Placement Activity Report
</h2>

<p class="text-center text-muted">
Generated on {datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")}
</p>


<div class="row text-center mb-4">

<div class="col-md-3">
<div class="card shadow-sm">
<div class="card-body">
<h4>{total_drives}</h4>
<p>Total Drives</p>
</div>
</div>
</div>

<div class="col-md-3">
<div class="card shadow-sm">
<div class="card-body">
<h4>{total_applications}</h4>
<p>Total Applications</p>
</div>
</div>
</div>

<div class="col-md-3">
<div class="card shadow-sm">
<div class="card-body">
<h4>{selected_students}</h4>
<p>Students Selected</p>
</div>
</div>
</div>

<div class="col-md-3">
<div class="card shadow-sm">
<div class="card-body">
<h4>{selection_rate}%</h4>
<p>Selection Rate</p>
</div>
</div>
</div>

</div>


<h4 class="mt-4">Application Pipeline</h4>

<table class="table table-bordered">

<thead class="table-dark">
<tr>
<th>Status</th>
<th>Count</th>
</tr>
</thead>

<tbody>

<tr><td>Applied</td><td>{applied}</td></tr>
<tr><td>Shortlisted</td><td>{shortlisted}</td></tr>
<tr><td>Interview</td><td>{interview}</td></tr>
<tr><td>Selected</td><td>{selected_students}</td></tr>
<tr><td>Rejected</td><td>{rejected}</td></tr>

</tbody>

</table>


<h4 class="mt-5">Top Companies by Applications</h4>

<table class="table table-striped">

<thead class="table-dark">
<tr>
<th>Company ID</th>
<th>Total Applications</th>
</tr>
</thead>

<tbody>
"""

    for company in top_companies:
        report_html += f"""
<tr>
<td>{company.id}</td>
<td>{company.applications}</td>
</tr>
"""

    report_html += """
</tbody>
</table>


<h4 class="mt-5">Recent Placement Drives</h4>

<table class="table table-striped">

<thead class="table-dark">
<tr>
<th>Drive ID</th>
<th>Job Title</th>
<th>Status</th>
<th>Deadline</th>
</tr>
</thead>

<tbody>
"""

    for drive in recent_drives:

        deadline = (
            drive.application_deadline.strftime("%Y-%m-%d")
            if drive.application_deadline else "N/A"
        )

        report_html += f"""
<tr>
<td>{drive.id}</td>
<td>{drive.job_title}</td>
<td>{drive.status}</td>
<td>{deadline}</td>
</tr>
"""

    report_html += """

</tbody>
</table>


<div class="text-center text-muted mt-5">
Placement Portal Automated Report
</div>

</div>

</body>
</html>
"""

    db.close()

    return report_html