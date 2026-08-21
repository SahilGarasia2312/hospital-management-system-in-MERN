# Hospital Management System (MERN Stack)
> **AI CONTEXT DOCUMENT & PROJECT OVERVIEW**

## 📖 Project Overview
This project is a comprehensive **Hospital Management System (HPMS)** built using the **MERN** stack (MongoDB, Express.js, React.js, Node.js). 
Its primary purpose is to manage Hospital entities, specifically **Doctors** and **Patients**. It handles authentication, role-based access control, doctor profile management, and assigning patients to doctors for tracking admission status, diseases, and treatments.

---

## 🔑 Demo & Reviewer Test Credentials

For quick evaluation, use the following pre-configured credentials:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@hpms.com` | `admin123` | Full system access, Manage Doctors/Patients, Pharmacy Queue & Stock Inventory |
| **🩺 Doctor** | `doctor@hpms.com` | `doctor123` | Doctor Dashboard, Clinical Encounter Workspace, Vitals/Diagnosis & Prescriptions |
| **🧑 Patient** | `patient@hpms.com` | `patient123` | Patient Dashboard, Appointment History, 360° Medical Timeline |

---

## 🏗️ Architecture & Tech Stack

### 1. Backend (Node.js + Express + MongoDB)
The backend employs a **Modular / Feature-Based Architecture** ensuring clean separation of concerns.

* **Path:** `/backend`
* **Core Technologies:** Express.js, Mongoose, JWT (JSON Web Tokens), bcryptjs.
* **Security Middleware:** Helmet, CORS, Express-Rate-Limit, Express-Mongo-Sanitize.
* **Directory Structure:**
  * `src/config/`: Configuration files (Database connection, Constants).
  * `src/middleware/`: Express middlewares (Auth verification, Role checks, Error handling).
  * `src/models/`: Shared models (e.g., `user.model.js` for base authentication).
  * `src/modules/`: Feature modules. Each feature (e.g., `auth`, `doctor`, `patient`) has its own:
    * `*.controller.js`: Request/Response handling.
    * `*.service.js`: Core business logic and database interactions.
    * `*.routes.js`: API route definitions.
    * `*.model.js`: Mongoose Schema definitions.
  * `src/utils/`: Utility functions (JWT signing/verification, standardized responses).

### 2. Frontend (React.js)
The frontend is a Single Page Application (SPA) utilizing React with a context-based state management approach.

* **Path:** `/frontend`
* **Core Technologies:** React 18, React Router v6, Axios, Styled-Components.
* **Styling:** A mix of CSS Modules, standard CSS, and `styled-components`. UI icons are provided by `lucide-react`.
* **Directory Structure:**
  * `src/api/`: Axios configuration and modular API call wrappers (`auth.api.js`, `doctor.api.js`, `patient.api.js`).
  * `src/components/`: Reusable, presentation-focused UI components (Cards, Badges, Forms, Navbars).
  * `src/context/`: Global State contexts (e.g., `AuthContext.jsx`, `DoctorContextProvider.js`).
  * `src/features/`: Page-level components grouped by role/feature domain (`admin`, `auth`, `doctor`, `patient`).
  * `src/hooks/`: Custom React hooks (`useAuth.js`, `useFetch.js`).
  * `src/routes/`: Routing logic including protected routes (`AppRoutes.jsx`, `ProtectedRoute.jsx`).

---

## 🗄️ Database Schema Context

### 1. User (`backend/src/models/user.model.js`)
* Handles authentication.
* **Roles:** `Admin`, `Doctor`, `Patient`.

### 2. Doctor (`backend/src/modules/doctor/doctor.model.js`)
* **Fields:** `doctorId` (unique), `name`, `specialization`, `experience`, `phone`, `email`.
* **Relations:** Linked to a `User` document via `userId` for authentication.

### 3. Patient (`backend/src/modules/patient/patient.model.js`)
* **Fields:** `patientId` (unique), `name`, `age`, `gender`, `contact`, `disease`, `symptoms`, `medicinePrescribed`, `admissionStatus` (e.g., Admitted, Discharged), `admittedDate`, `releasingDate`.
* **Relations:** 
  * Linked to a `Doctor` document via `doctorId` (the doctor assigned to the patient).
  * Linked to a `User` document via `userId` (for patient-specific login).

---

## 🚀 Development Setup & Workflow

### Prerequisites
* Node.js
* MongoDB Database (Local or MongoDB Atlas)

### Running the Application Locally
There is a convenient script provided in the frontend to run both servers concurrently.

1. **Install Dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Environment Variables:**
   * Create a `.env` file in the `backend/` directory using `backend/.env.example` as a template (requires `MONGO_URI`, `JWT_SECRET`, `PORT`).
   * Create a `.env` (or `.env.local`) in the `frontend/` directory (requires `REACT_APP_API_URL`).

3. **Start the Application:**
   From the `frontend` directory, run:
   ```bash
   npm run both
   ```
   *This command leverages `concurrently` to spin up the React development server and the Backend Node/Express server simultaneously.*

### Testing
* Backend tests (Jest + Supertest) can be run via: `cd backend && npm test`
* Frontend tests (React Testing Library) can be run via: `cd frontend && npm test`
