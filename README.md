# Anonymous AI-Driven Faculty Feedback & Analytics System

A full-stack, production-ready web application for college environments that enables anonymous student feedback with AI-powered analytics and multi-tier role-based access control.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Database | Prisma ORM + SQLite |
| Auth | JWT via `jose` + HTTP-only cookies |
| Styling | Vanilla CSS Modules |
| Charts | Chart.js (via react-chartjs-2) |
| AI/NLP | `sentiment` npm package |
| Security | Next.js Proxy (Middleware) |

---

## 🎯 Features

### 🔐 Authentication & Security
- Role-based login: **Student**, **Faculty**, **HOD**, **Principal**
- JWT session management with HTTP-only cookies
- Server-side route protection via Next.js Proxy
- Automatic role-based redirects on login

### 🎓 Student Portal
- Anonymous one-time feedback tokens (cryptographically hashed)
- Voice-to-text feedback input (Web Speech API)
- Feedback window countdown timer
- Celebratory success animation on submission
- Subjects with available/completed feedback status

### 👨‍🏫 Faculty Dashboard
- Personal analytics: overall rating, clarity, engagement, punctuality
- Subject-wise performance comparison chart
- Month-over-month performance trend chart
- Sentiment analysis doughnut chart
- AI-generated insights and actionable suggestions
- Achievement badges (Excellence Star, Time Master, Student Magnet, etc.)
- Anonymized student feedback feed with colored avatars
- Print-to-PDF export

### 🏢 HOD Dashboard
- Department-wide faculty comparison bar chart
- Faculty ranking table
- Subject-wise performance breakdown panel
- CSV data export
- Print-to-PDF support

### 🏛️ Principal Dashboard
- Institutional summary (avg rating, total feedback, departments)
- Monthly participation health bar with token-to-submission conversion rate
- System Audit Trail (chronological log of submissions & token claims)
- Departmental performance comparison chart
- Full faculty search and department filter
- Clickable faculty rows → detailed sentiment breakdown modal
- **Global Feedback Window Toggle** (Open/Close submissions)
- CSV + PDF export

---

## 🗄️ Database Schema

```
User → Department → Subject → FeedbackToken → Feedback
                            → StudentTokenClaim
FacultySubject (faculty ↔ subject mapping)
StudentSubject (student ↔ subject mapping)
SystemSettings (global admin controls)
```

---

## 🛠️ Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/karatekarshivani-art/student---faculty-feedback.git
cd student---faculty-feedback

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env and set JWT_SECRET

# 4. Initialize database and seed data
npx prisma db push
npx ts-node prisma/seed.ts

# 5. Run development server
npm run dev
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Principal | principal@college.edu | password123 |
| HOD | hod.cs@college.edu | password123 |
| Faculty | faculty1@college.edu | password123 |
| Student | student1@college.edu | password123 |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/login/       # JWT authentication
│   │   ├── admin/analytics/  # HOD & Principal analytics
│   │   ├── admin/export/     # CSV export
│   │   ├── admin/settings/   # Global system settings
│   │   ├── faculty/analytics/ # Faculty-specific analytics
│   │   ├── feedback/submit/   # Anonymous submission
│   │   ├── feedback/tokens/   # Token generation
│   │   └── student/subjects/  # Subject listing
│   ├── faculty/   # Faculty dashboard page
│   ├── hod/       # HOD dashboard page
│   ├── login/     # Login page
│   ├── principal/ # Principal dashboard page
│   ├── student/   # Student dashboard page
│   └── globals.css
├── lib/
│   ├── auth.ts    # JWT helpers
│   └── prisma.ts  # Prisma client singleton
└── proxy.ts       # Route protection middleware
```

---

## 🔒 Privacy & Anonymity

- Feedback is **never** linked to student identity in the database
- Cryptographic one-time tokens decouple student identity from submissions
- The `StudentTokenClaim` table tracks only participation, not content
- Faculty and admins can never identify which student submitted which feedback

---

## 📊 AI Analytics

- **Sentiment Analysis**: NLP-based classification (Positive / Neutral / Negative) using the `sentiment` package
- **AI Insights**: Rule-based contextual suggestions generated per faculty member
- **Achievement Badges**: Gamified performance milestones awarded automatically

---

*Built with ❤️ for academic excellence.*
