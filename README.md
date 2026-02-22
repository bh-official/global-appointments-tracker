# Global Appointments Tracker

A professional, database-driven React application designed to manage appointments across different time zones. This project provides a secure, organized, and visually stunning interface for users to keep track of their global meetings.

## 🔗 Deployment Links

- **GitHub Repository**: [https://github.com/bh-official/global-appointments-tracker](https://github.com/bh-official/global-appointments-tracker)
- **Live Client Application**: [https://global-appointments-tracker.onrender.com/](https://global-appointments-tracker.onrender.com/)
- **Live Server API**: [https://global-appointments-tracker-server.onrender.com](https://global-appointments-tracker-server.onrender.com)

---

## 💡 The Inspiration

For a long time, I struggled to manage schedules across different time zones. Coordinating meetings and online classes with people in different countries was exhausting—constantly manually converting times and setting alarms for every single event. One mistake in calculation could mean missing an important class or meeting.

I decided to build the **Global Appointments Tracker** to solve this personal pain point once and for all. I wanted an app where I could simply enter the appointment in the target country's timezone, and let the system handle the conversion and notify me automatically via email exactly when I need to be ready.

---

## ⚙️ How the App Works

The Global Appointments Tracker is a full-stack (MERN-style) application that automates the lifecycle of an appointment from creation to notification.

### 1. Creation & Timezone Handling
Users can create appointments by picking a title, category, and a specific date/time. The core feature is the **Timezone Selector**, which uses the `luxon` library to handle complex UTC offsets. The app ensures data integrity by preventing any appointment from being set in the past relative to the selected country's current time.

### 2. Secure Data Management
All appointments are stored in a **PostgreSQL database** (hosted on Supabase).
- **Authentication**: Each user has a private account managed through **Supabase Auth**.
- **Relational Data**: Categories are stored in a separate table and linked to appointments via foreign keys.

### 3. Smart Filtering & Categorization
The dashboard allows for multi-layered filtering by category and time range, with real-time UI polling every 60 seconds to keep data fresh.

### 4. Automated Email Reminder System
The Express server runs a background task every minute using `node-cron` to scan for upcoming appointments and send email notifications via `nodemailer`.

---

## 🔐 Authentication & Security (Supabase Auth)

Security and data isolation were top priorities for this project. I integrated **Supabase Auth** to provide a production-grade authentication layer:

- **Identity Management**: Users can securely sign up and log in. Supabase handles all encryption and password security out of the box.
- **JWT-Based Protection**: Every request from the frontend to the backend includes a JSON Web Token (JWT). The Express server verifies this token to ensure only authorized users can access the API.
- **Client-Side Protected Routes**: I used React Router hooks to create a `ProtectedRoute` component. This prevents unauthenticated users from accessing the dashboard or creation forms.
- **Data Isolation**: All database queries are scoped to the `user_id` of the logged-in user. This ensures total privacy—users can only view, edit, or delete their own appointments.

---

## 🛠️ The Tech Stack (Deep Dive)

### **Frontend (The Client)**
- **React 19 & Vite**: For high-performance rendering and fast development.
- **React Router 7**: Managed all application state through URLs, enabling deep-linking.
- **Tailwind CSS 4**: Custom **Glassmorphism framework** for a premium aesthetic.
- **Luxon**: Backbone for timezone-aware date parsing and validation.
- **Supabase Client SDK**: Handled secure user authentication and session management.

### **Backend (The Server)**
- **Node.js & Express 5**: Handled API requests and background logic.
- **pg (node-postgres)**: Used for writing optimized SQL queries and joins.
- **Supabase Admin SDK**: Securely accessed user metadata (like emails) for notifications.
- **Dotenv & Cors**: Managed security, environment variables, and cross-origin policies.

### **Automation & Utilities**
- **Node-cron**: Orchestrated background tasks for appointment checking.
- **Nodemailer**: Delivered real-time email notifications to users.
- **PostgreSQL**: Relational database hosted on Supabase for data persistence.

---

## ✅ Assignment Checklist

- [x] **React Client**: Built with Vite and modern React 19.
- [x] **Express Server**: Node.js backend with RESTful endpoints.
- [x] **Database Schema**: Structured Relational Database in PostgreSQL.
- [x] **React Forms**: Intuitive forms for creating/editing appointments.
- [x] **React Router**: Multi-page navigation with 6+ distinct routes.
- [x] **Database Polling**: Background UI sync using `setInterval`.
- [x] **Stretch Goals**: Category routing, Delete, Likes, Advanced SQL, Premium UI.

---

## 🧠 Reflection

### Challenges & Struggles
The biggest struggle was **Timezone Validation**. Managing appointments across different zones required shifting from standard JS `Date` objects to the `luxon` library to accurately compare times in remote zones against the current moment.

### What I Learned New
I mastered **Glassmorphism Design**, implemented **Server-Side CRON Jobs** for the first time, and learned to bridge **Supabase Auth** between a client frontend and a custom Node.js backend.
