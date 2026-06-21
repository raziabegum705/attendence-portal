# 🎓 Student Attendance Alert Portal

> A full-stack MERN web application that automates college attendance monitoring, sends Email & WhatsApp alerts to defaulters (<75%), and manages an AI-assisted excuse letter workflow for HODs.
> **Theme:** Flipkart-inspired UI (Blue #2874f0 + Orange #fb641b)

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 📊 Excel Upload | Upload `.xlsx` attendance sheets — auto-detect defaulters |
| 📧 Email Alerts | Automated Nodemailer emails to all defaulters |
| 💬 WhatsApp Alerts | Twilio WhatsApp API notifications |
| 🔗 Unique Links | JWT-secured, time-limited links per student |
| 🤖 Gemini AI | Auto-generate formal excuse letter drafts |
| ✅ HOD Dashboard | Approve/reject letters with optional remarks |
| 🔐 Role-Based Auth | Teacher & HOD roles with JWT |
| 📈 AI Insights | Gemini analytics summary for HOD |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite + Custom CSS (Flipkart theme) |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Email | Nodemailer (Gmail SMTP) |
| WhatsApp | Twilio WhatsApp API |
| AI | Google Gemini 1.5 Flash |
| File Parse | SheetJS (xlsx) |
| Hosting | Render (backend) + Vercel (frontend) |

---

## 📁 Project Structure

```
attendance-alert-portal/
├── client/                    ← React frontend (Vite)
│   ├── src/
│   │   ├── api/axiosConfig.js
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── DefaulterTable.jsx
│   │   ├── context/AuthContext.jsx
│   │   └── pages/
│   │       ├── LoginPage.jsx
│   │       ├── TeacherDashboard.jsx
│   │       ├── HODDashboard.jsx
│   │       └── StudentLetterPage.jsx
│   └── package.json
│
└── server/                    ← Node.js + Express backend
    ├── config/db.js
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── utils/
    ├── server.js
    └── package.json
```

---

## 🚀 Setup Guide (VS Code)

### Step 1 — Prerequisites

Make sure you have installed:
- [Node.js v18+](https://nodejs.org)
- [Git](https://git-scm.com)
- [VS Code](https://code.visualstudio.com)
- [MongoDB Atlas account](https://cloud.mongodb.com) (free tier)

### Step 2 — Open in VS Code

```bash
# Open the project folder in VS Code
code attendance-alert-portal
```

Or: **File → Open Folder → select `attendance-alert-portal`**

### Step 3 — Install Dependencies

Open **two terminals** in VS Code (`Ctrl + `` ` ``):

**Terminal 1 — Backend:**
```bash
cd server
npm install
```

**Terminal 2 — Frontend:**
```bash
cd client
npm install
```

### Step 4 — Configure Environment Variables

```bash
# In the server folder:
cp server/.env.example server/.env
```

Open `server/.env` and fill in:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/attendance
JWT_SECRET=mysecretkey123changeThis

# Gmail (create App Password at myaccount.google.com/apppasswords)
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx

# Twilio (optional — skip if not using WhatsApp)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Gemini AI (get free key at aistudio.google.com)
GEMINI_API_KEY=AIzaSy_xxxxxxxxxxxxx

CLIENT_URL=http://localhost:5173
```

### Step 5 — Run the Project

**Terminal 1 — Start Backend:**
```bash
cd server
npm run dev
# Server runs at http://localhost:5000
```

**Terminal 2 — Start Frontend:**
```bash
cd client
npm run dev
# App runs at http://localhost:5173
```

Open your browser at **http://localhost:5173** 🎉

---

## 📊 Expected Excel Format

Your `.xlsx` file must have these column headers **exactly**:

| Roll No | Student Name | Email | Phone | Classes Attended | Total Classes |
|---------|-------------|-------|-------|-----------------|---------------|
| CS001 | Aisha Raza | aisha@college.edu | 9876543210 | 28 | 40 |
| CS002 | Rahul Verma | rahul@college.edu | 9876543211 | 25 | 40 |

> Students with attendance < 75% are automatically flagged as defaulters.

---

## 🧪 Testing the App

1. **Register** as a `teacher` → upload a sample Excel file
2. **View defaulters** → click "Send Email + WhatsApp Alerts"
3. Open the email link as a **student** → fill excuse letter → use AI draft
4. **Register** as `hod` → view submitted letters → approve/reject
5. Click **Generate Insights** for AI analytics

---

## 🌐 GitHub Push

```bash
# Initialize git (run from project root)
git init
git add .
git commit -m "feat: Initial commit - Student Attendance Alert Portal"

# Create repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/attendance-alert-portal.git
git branch -M main
git push -u origin main
```

---

## 🚀 Free Deployment

### Backend → Render.com
1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo
3. Root directory: `server`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add all `.env` variables in Environment section

### Frontend → Vercel.com
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import GitHub repo
3. Root directory: `client`
4. Framework: Vite
5. Set environment variable: `VITE_API_URL=https://your-render-url.onrender.com`

---

## 🎨 UI Theme

Inspired by **Flipkart** design system:
- Primary Blue: `#2874f0`
- Action Orange: `#fb641b`  
- Font: Poppins
- Clean card-based layout with subtle shadows

---

## 📋 API Reference

| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| POST | `/api/auth/register` | Public | Register teacher/HOD |
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/upload/attendance` | JWT | Upload Excel file |
| GET | `/api/upload/history` | JWT | Past uploads |
| POST | `/api/notify/send` | JWT | Send email+WhatsApp |
| GET | `/api/letter/form/:token` | Token | Get student form |
| POST | `/api/letter/submit/:token` | Token | Submit excuse letter |
| POST | `/api/ai/draft/:token` | Token | Gemini AI draft |
| GET | `/api/hod/letters` | JWT+HOD | All letters |
| PATCH | `/api/hod/letters/:id` | JWT+HOD | Approve/reject |
| GET | `/api/ai/insights` | JWT+HOD | AI analytics |

---

## 🔑 Getting API Keys

| Service | Free? | Link |
|---------|-------|------|
| MongoDB Atlas | ✅ Free 512MB | cloud.mongodb.com |
| Gmail App Password | ✅ Free | myaccount.google.com/apppasswords |
| Gemini API | ✅ Free tier | aistudio.google.com |
| Twilio WhatsApp | ⚠️ Trial ($0 credit) | twilio.com |

---

## 👨‍💻 Interview Talking Points

1. **Architecture**: MERN stack with REST APIs, JWT auth, role-based access
2. **File parsing**: SheetJS converts `.xlsx` to JSON on Node.js backend
3. **Security**: JWT-signed unique links with expiry for each student
4. **AI Integration**: Gemini 1.5 Flash for letter drafting and analytics
5. **Notifications**: Nodemailer (email) + Twilio (WhatsApp) with async error handling

---

*Built as a full-stack portfolio project demonstrating MERN + AI + third-party API integration.*
