# 📂 Secure Document Management System (DMS)

A robust, full-stack Document Management System designed for secure file storage, granular access control, and document versioning. 

## ✨ Key Features
* **Role-Based Access Control (RBAC):** Admin and Employee roles with secure routing and API protection.
* **Granular Permissions:** Share documents with specific users using `View`, `Download`, or `Edit` access rights.
* **Document Versioning:** Maintain a full history of document edits and easily upload new versions.
* **Secure Public Sharing:** Generate temporary public links with expiration dates and maximum click limits.
* **In-Browser Viewing:** View supported files (like PDFs and images) directly in the browser without downloading.
* **Comprehensive Audit Logs:** Track all user actions, including file uploads, downloads, and permission changes.

## 🛠️ Tech Stack
* **Frontend:** Angular (Standalone Components, Signals), Tailwind CSS, Lucide Icons
* **Backend:** Node.js, Express.js, Prisma ORM, Multer (File Uploads)
* **Security:** JWT Authentication, Bcrypt Hashing, Zod Validation

## 🚀 Getting Started
1. Clone the repository.
2. Run `npm install` in both the frontend and backend directories.
3. Set up your `.env` variables (Database URL, JWT Secret, etc.).
4. Run `npx prisma db push` to generate the database schema.
5. Start the backend (`npm run dev`) and frontend (`ng serve`).