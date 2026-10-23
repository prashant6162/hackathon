# SkillConnect – Learn Locally, Grow Together

> **Problem Statement 049:** Individuals within a locality possess hidden and underutilized skills, but there is no structured, trustworthy platform to discover local talent, enroll in learning sessions, and exchange knowledge without monetary transactions.

SkillConnect is a full-featured, responsive, production-ready web application built with **React, TypeScript, Tailwind CSS, Lucide Icons, and Firebase / Persistent Reactive Demo Engine** with **OpenStreetMap + Leaflet** interactive neighborhood maps.

---

## 🌟 Key Features

### 1. 100% Non-Monetary Knowledge Barter Model
- **Zero Payments & Zero Gateway:** Members exchange knowledge, time, and crafts rather than money.
- **Mutual Skill Exchange (Barter):** Propose mutual exchanges (e.g., "I'll teach you UI/UX design in exchange for an Acoustic Guitar session!").
- **Community Learning Sessions:** Join free sessions shared by generous local mentors even without a direct reciprocal swap.

### 2. Smart Skill Matching Algorithm
Calculates a transparent match score (0–100%) and explains reasons:
- **Desired Skills Alignment (Up to 40 pts):** Matches topics in the learner's profile with offered skill tags and keywords.
- **Reciprocal Opportunity Bonus (25 pts):** Detects if the teacher wants to learn a skill you teach, creating a mutual exchange match!
- **Format Match (15 pts):** Matches in-person, online, or flexible formats.
- **Locality & Proximity (15 pts):** Uses Haversine geographic calculation when coordinates are available, or locality/neighborhood text match.
- **Trust & Reputation (5 pts):** Boosts mentors with 4.8+ verified review ratings.

### 3. End-to-End Booking & Session Workflow
1. Browse or filter skills by category, level, format, or locality.
2. Select an open session time slot from the teacher's schedule.
3. Propose a mutual barter exchange with custom or profile skills.
4. Duplicate active booking requests and over-capacity slots are automatically prevented.
5. In-app notifications inform the teacher immediately.
6. The teacher accepts or rejects the session in "My Teaching Sessions".
7. Sessions can be marked **Completed** by participants through an explicit user action.
8. Completed sessions unlock ratings, reviews, and criteria breakdowns.

### 4. Interactive Neighborhood Map (OpenStreetMap & Leaflet)
- Interactive map rendering active local skill nodes with custom markers.
- Click any marker to view the skill card popup and jump directly into the session details.
- Respects user privacy: approximate neighborhood center points are used rather than sensitive exact street addresses.

### 5. In-App Messaging & Notifications
- Direct messaging between learners and teachers with quick suggestion chips.
- Notification dropdown with unread badge counter for bookings, acceptances, messages, and reviews.

### 6. Verified Peer Reviews & Ratings
- Only participants in mutually completed sessions can leave reviews (no fabricated reviews).
- Self-rating prevention.
- Detailed criteria ratings for **Teaching Quality**, **Communication & Clarity**, and **Punctuality & Reliability**.
- Community reporting mechanism with Admin moderation queue.

### 7. Dual-Mode Backend Architecture
- **Firebase Live Mode:** Ready for Firebase Authentication, Cloud Firestore, and Firebase Storage via `.env`.
- **Persistent Demo Engine:** Automatically activates if Firebase credentials are not provided. Uses reactive browser `localStorage` with pre-loaded realistic personas, bookings, and reviews. Switch personas in 1 click via the top navbar.

---

## 👥 Preloaded Demo Personas

| Name | Role / Specialty | Locality | Teaches | Wants to Learn |
| :--- | :--- | :--- | :--- | :--- |
| **Maya Patel** | Product Designer | Mission District, SF | UI/UX Design, Figma, Watercolor | Python, Spanish, Sourdough |
| **David Chen** | Senior Software Engineer | Sunset District, SF | React, Node.js, TypeScript, Python | Guitar, French, Photography |
| **Elena Rostova** | Acoustic Guitarist & Pianist | Marina District, SF | Acoustic Guitar, Piano, Russian | UI/UX Design, Figma, Cooking |
| **Carlos Ramirez** | Traditional Home Cook | SOMA, SF | Oaxacan Mole, Sourdough Bread | React, TypeScript, Photography |
| **Priya Sharma** | 500-hr Certified Yoga Instructor | Downtown Oakland | Hatha Yoga, Breathwork | Public Speaking, UI/UX |
| **Marcus Vance** | Street & Portrait Photographer | Elmwood, Berkeley | Portrait Photography, Lightroom | Guitar, Spanish, Cooking |
| **Sarah Jenkins** | Platform Administrator | Civic Center, SF | Community Organizing | Python, Mandarin |

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + PostCSS + Autoprefixer
- **Icons:** Lucide React
- **Maps:** Leaflet + OpenStreetMap
- **Delight:** Canvas Confetti for booking and review celebrations
- **Backend:** Firebase (Auth, Cloud Firestore) or Built-in Reactive Local Engine

---

## 🚀 Quick Start Guide

### 1. Installation
```bash
npm install
```

### 2. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Preview
```bash
npm run build
npm run preview
```

---

## 🔑 Environment Variables (Optional Firebase Setup)

To connect real Firebase services, create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

If these keys are left empty or omitted, SkillConnect automatically runs in **Persistent Demo Mode**, allowing you to test all 13 pages, bookings, notifications, reviews, and messaging without cloud configuration.
