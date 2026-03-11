# Placement Portal

A web application that connects **students and companies** for campus placements.
Students can explore placement drives and apply to them, while companies can create and manage hiring drives.
Administrators oversee the platform, approve companies, and manage security.

The project uses **Flask for the backend API** and **Vue.js for the frontend UI**.

---

# Features

## Student Features

* Browse registered companies
* Search and view placement drives
* Check eligibility for drives
* Apply to placement drives
* Track application status
* Export applications as CSV
* Edit profile and upload portfolio links

## Company Features

* Create and manage placement drives
* View student applications
* Update application status (shortlisted / selected / rejected)
* Close drives after recruitment
* Company approval system before accessing features

## Admin Features

* Approve or reject company registrations
* View platform statistics
* Monitor drives and applications
* Blacklist or reactivate users
* View analytics charts (users, drives, hiring companies)

---

# Technology Stack

## Backend

* **Flask**
* **Flask Blueprints**
* **SQLAlchemy ORM**
* **SQLite database**

## Frontend

* **Vue.js**
* **Bootstrap**
* **Chart.js** (for admin analytics)

## Background Tasks

* **Celery**
* **Redis**

Used for:

* exporting CSV reports
* scheduled jobs
* report generation

---

# Project Structure

```
Placement_Portal_Application/
│
├── backend/
│   ├── models.py
│   ├── database.py
│   ├── config.py
│   ├── app.py
│   ├── cache.py
│   ├── celery_worker.py
│   │   
│   ├── controllers/
│   │   ├── admin.py
│   │   ├── auth.py
│   │   ├── company.py
│   │   ├── student.py
│   │ 
│   └── tasks/
│   │   ├── __init__.py
│   │   ├── exports.py
│   │   ├── reminders.py
│   │   ├── reports.py
│
├── frontend/
│   ├── index.html
│   ├── main.js
│   ├── router.js
│   │
│   ├── components/
│   │   └── Navbar.js
│   │
│   ├── views/
│   │   ├── LoginView.js
│   │   ├── RegisterStudentView.js
│   │   ├── RegisterCompanyView.js
│   │   ├── AdminDashboard.js
│   │   ├── CompanyDetailsView.js
│   │   ├── DriveDetailsView.js
│   │   ├── ApplicationDetailsView.js
│   │   ├── CompanyDashboard.js
│   │   ├── ApplicationDetailsCompanyView.js
│   │   ├── CreateDriveView.js
│   │   ├── StudentDashboard.js
│   │   ├── DriveDetailsStudentView.js
│   │   ├── ApplicationHistoryView.js
│   │   ├── CompanyDetailsStudentView.js
│   │   └── StudentEditProfileView.js
│   │
│   ├── assets/
│   │   └── style.css
│   
├── requirements.txt
├── run.py
└── README.md
```

---

# User Roles

The system supports **three roles**:

### Student

* Apply to drives
* View companies
* Track applications

### Company

* Create placement drives
* Manage applicants
* Hire students

### Admin

* Approve companies
* Moderate platform
* View analytics
* Manage security

---

# Installation

### 1. Clone the repository

```bash
git clone https://github.com/22f3002199/Placement_Portal_Application.git
cd Placement_Portal_Application
```

---

### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate it:

Mac / Linux

```
source venv/bin/activate
```

Windows

```
venv\Scripts\activate
```

---

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

---

### 4. Run Redis (for Celery)

Example:

```bash
redis-server
```

---

### 5. Start Celery worker

```bash
celery -A backend.celery_worker worker --loglevel=info
```

---

### 6. Run the Flask server

```bash
python run.py
```

The app will run at:

```
http://127.0.0.1:5000
```

---

# Admin Account

An admin account exists in the database.

Credentials:
```
Email: admin@portal.com
Password: admin123
```

Admins can:

* approve companies
* blacklist users
* monitor the system

---

# Background Jobs

The system uses **Celery workers** for asynchronous tasks.

Examples:

* Export student applications as CSV
* Generate reports
* Scheduled notifications

---

# Key Functionalities

## Placement Drives

Companies can create drives with:

* job title
* salary
* description
* eligibility requirements
* deadline

Students can apply if eligible.

---

## Application Tracking

Applications move through statuses:

```
applied
shortlisted
selected
rejected
```

Companies update statuses directly from the dashboard.

---

## Security

Admin controls include:

* rejecting companies
* blacklisting users
* reactivating accounts

---

# Analytics

The admin dashboard includes charts for:

* user distribution
* drive activity
* top hiring companies

Charts are built using **Chart.js**.

---

# CSV Export

Students can export all their applications as a CSV report.

The export runs as an **asynchronous Celery task** and becomes available for download once ready.


---

# License

MIT License