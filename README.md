<div align="center">

# ⚡ AFriendlyCoding

### A social LeetCode companion — track, compare, and compete with friends

[![Status](https://img.shields.io/badge/status-actively%20developing-00d084?style=flat-square)](.)
[![Java](https://img.shields.io/badge/Java-21-f89820?style=flat-square&logo=openjdk)](.)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](.)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3-6db33f?style=flat-square&logo=spring)](.)
[![Chrome Extension](https://img.shields.io/badge/Extension-Manifest%20V3-4285f4?style=flat-square&logo=googlechrome)](.)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4479a1?style=flat-square&logo=PostgreSQL)](.)

<br/>

> Most coding platforms focus only on individual progress.  
> **AFriendlyCoding adds a social layer** — see friends' stats, compare problem-solving skills, and build a coding network that keeps you accountable.

</div>

---

## 📖 Overview

AFriendlyCoding is a full-stack social coding platform built around LeetCode. It lets developers sync their solved problems via a Chrome extension, view rich profiles, connect with friends, and compete on a leaderboard — all inside a dark glassmorphism UI.

The platform has **three independent parts** that work together:

| Part | Tech | Purpose |
|------|------|---------|
| **Chrome Extension** | · Manifest V3 | Authenticates with the backend, fetches solved problems and streak from LeetCode's GraphQL API, syncs to backend automatically |
| **Backend** | Spring Boot 3 · PostgreSQL · JWT | REST API handling auth, friend system, LeetCode sync, user stats |
| **Frontend** | React 19 · Vite · Tailwind CSS | Dark glassmorphism UI — dashboard, profiles, friends, leaderboard, compare, stats |

---

## ✨ Features

### 🔐 Authentication
- User registration and login
- JWT-based authentication with protected routes
- Session persistence via `localStorage`

### 🔄 LeetCode Sync (Chrome Extension)
- Fetches all solved problems directly from LeetCode's GraphQL API using your browser cookies — no password sharing
- Smart diff sync — only uploads problems not already in the backend
- Syncs avatar, real name, LeetCode username, current streak, and weekly solved count
- Live streak counter using LeetCode's `getStreakCounter` query (matches what you see on LeetCode profile)
- Auto-syncs profile stats after every problem sync — one click does everything

### 👤 User Profiles
- Own profile: full stats, difficulty split, solved problems list, friends list
- Friend profiles: stats visible to friends, locked behind a blurred skeleton for non-friends with "Send friend request to see data"
- Real avatar from LeetCode or generated gradient fallback

### 👥 Friend System
- Search users by username with live dropdown
- Send / accept / reject / withdraw friend requests
- View incoming and sent requests with counts
- Remove friends
- Friends tab on profiles showing mutual network

### 📊 Stats & Analytics
- Total solved, easy / medium / hard breakdown with progress bars
- Current streak and weekly count
- Completion percentage against all LeetCode problems
- Last synced timestamp

### ⚔️ Compare
- Side-by-side comparison of any two users
- Head-to-head stat bars (total, easy, medium, hard, streak, this week)
- 6-axis topic radar chart built from real solved problem tags
- Problem overlap table — filter by Both / Only User 1 / Only User 2 / All
- Auto-loads when navigating from a friend card

### 🏆 Leaderboard
- Rank friends by streak and weekly solves
- Medal badges for top 3

---

## 🗂️ Project Structure

```
AFriendlyCoding/
│
├── backend/                          # Spring Boot application
│   └── src/main/java/com/yatharth/backend/
│       ├── Controller/
│       │   ├── AuthController.java
│       │   ├── LeetCodeSyncController.java
│       │   ├── FriendController.java
│       │   ├── QuestionController.java
│       │   └── SearchController.java
│       ├── Service/
│       │   ├── AuthService.java
│       │   ├── SyncService.java
│       │   └── FriendService.java
│       ├── Model/
│       │   ├── User.java
│       │   ├── Question.java
│       │   ├── SolvedQuestion.java
│       │   └── FriendRequest.java
│       ├── DTOs/
│       │   ├── UserDto.java
│       │   ├── UserMapper.java
│       │   ├── FriendRequestDto.java
│       │   ├── FriendRequestMapper.java
│       │   ├── SyncRequest.java
│       │   └── UserProfileDto.java
│       └── Repository/
│           ├── UserRepository.java
│           ├── QuestionRepository.java
│           ├── SolvedQuestionRepository.java
│           └── FriendRepository.java
│
├── frontend/                         # React application
│   └── src/
│       ├── api/
│       │   └── axiosClient.js        # All API calls in one place
│       ├── components/
│       │   ├── home/                 # ProblemRow, feed components
│       │   └── layout/              # Sidebar, FollowedFriends
│       └── pages/
│           ├── Dashboard.jsx
│           ├── MyProfile.jsx
│           ├── ProfilePage.jsx
│           ├── FriendsPage.jsx
│           ├── ComparePage.jsx
│           ├── StatsPage.jsx
│           └── ProblemsPage.jsx
│
└── extension/                        # Chrome Extension (Manifest V3)
    ├── manifest.json
    ├── popup.html
    └── src/
        ├── popup.js                  # Login UI, sync orchestration, live stats
        ├── content.js                # Injected into leetcode.com — GraphQL fetcher
        └── background.js             # Service worker
```

---

## 🚀 Getting Started

### Prerequisites

- Java 21
- Node.js 18+
- PostgreSQL 
- Google Chrome

---

### 1. Backend

**Clone the repository**

```bash
git clone https://github.com/yourusername/AFriendlyCoding.git
cd AFriendlyCoding/backend
```

**Create the database**

```sql
CREATE DATABASE afriendlycoding;
```

**Configure `src/main/resources/application.properties`**

```properties
spring.datasource.url=jdbc:postgreSQL://localhost:3306/afriendlycoding
spring.datasource.username=your_PostgreSQL_username
spring.datasource.password=your_PostgreSQL_password
spring.datasource.driver-class-name=com.PostgreSQL.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

jwt.secret=your_jwt_secret_key_minimum_32_characters
jwt.expiration=86400000
```

**Run**

```bash
./mvnw spring-boot:run
```

Backend starts on **http://localhost:8080**

---

### 2. Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Frontend starts on **http://localhost:5173**

> If your backend is on a different port, update `baseURL` in `src/api/axiosClient.js`

---

### 3. Chrome Extension

1. Open Chrome → go to `chrome://extensions`
2. Enable **Developer Mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `extension/` folder
5. The ⚡ icon will appear in your Chrome toolbar

**Using the extension**

1. Make sure **leetcode.com** is open in a tab and you are logged in
2. Click the ⚡ extension icon
3. Sign in with your **AFriendlyCoding** credentials (not your LeetCode credentials)
4. Click **Sync Problems** — fetches all your solved problems from LeetCode and uploads to backend
5. Click **Sync Profile** — syncs your avatar, streak, and weekly count
6. Click ↻ to refresh the live streak/week stats anytime

> The extension injects into your open LeetCode tab and uses your existing LeetCode browser session (cookies) to call LeetCode's GraphQL API. Your LeetCode credentials are never sent to AFriendlyCoding's backend.

---

## 🔌 API Reference

### Auth — `/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | ✗ | Register — body: `{username, email, password}` |
| `POST` | `/auth/login` | ✗ | Login — body: `{username, password}` → returns `{token}` |
| `GET` | `/auth/me` | ✓ | Get current authenticated user |

---

### LeetCode Sync — `/api/leetcode`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/leetcode/sync` | ✓ | Sync solved problems, auto-recounts difficulty breakdown |
| `POST` | `/api/leetcode/sync/profile` | ✓ | Sync avatar, name, streak, weekly count |
| `GET` | `/api/leetcode/lastSyncedAt` | ✓ | Get last sync timestamp |

**Sync request body:**
```json
{
  "problems": [
    {
      "frontendId": 1,
      "title": "Two Sum",
      "slug": "two-sum",
      "difficulty": "EASY",
      "status": "SOLVED",
      "topics": "Array,Hash Table"
    }
  ]
}
```

**Profile sync body:**
```json
{
  "avatar": "https://...",
  "realName": "Yatharth Singh",
  "leetCodeUsername": "_StarrySyntax_",
  "isSignedIn": true,
  "streak": 7,
  "problemsSolvedInAWeek": 12,
  "lastSyncedAt": "2026-03-13T10:30:00"
}
```

---

### Questions — `/questions`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/questions/get/{username}` | ✗ | Get all solved questions for a user |

---

### Friends — `/friends`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/friends/accepted` | ✓ | Get accepted friends list with full UserDto |
| `POST` | `/friends/request/create` | ✓ | Send request — params: `senderUsername`, `receiverUsername` |
| `POST` | `/friends/request/{id}/accept` | ✓ | Accept a request by request ID |
| `POST` | `/friends/request/{id}/reject` | ✓ | Reject a request by request ID |
| `DELETE` | `/friends/request/{id}/withdraw` | ✓ | Withdraw a sent request |
| `GET` | `/friends/requests/incoming` | ✓ | Get incoming pending requests |
| `GET` | `/friends/requests/sent` | ✓ | Get sent pending requests |
| `GET` | `/friends/request/check` | ✓ | Check status — params: `senderUsername`, `receiverUsername` |
| `GET` | `/friends/get/user/{username}` | ✓ | Get full UserDto (stats) for any user |

---

### Search — `/search`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/search/users/get` | ✓ | Search users — param: `query` |
| `GET` | `/search/users/profile` | ✓ | Get profile — param: `username` |

---

## 🗃️ Data Models

### User
```
id, username, email, password (BCrypt),
name, avatar, leetcodeUsername,
streak, solvedProblemsInAWeek,
totalSolvedProblem, easyProblems, mediumProblems, hardProblems,
lastSyncedAt
```

### Question
```
id, frontendId, title, slug, difficulty (EASY/MEDIUM/HARD)
```

### SolvedQuestion
```
id, user → User, question → Question
```

### FriendRequest
```
id, sender → User, receiver → User,
status (PENDING / ACCEPTED / REJECTED)
```

---

## 🔧 How the Sync Works

```
Click "Sync Problems"
  │
  ├─ popup.js injects content.js into the open LeetCode tab
  │
  ├─ content.js calls LeetCode's problemsetQuestionListV2 GraphQL
  │   └─ Paginates 500 problems/request · filters status === "SOLVED"
  │
  ├─ Stores results in chrome.storage.local
  │
  ├─ popup.js polls storage every 800ms until complete
  │
  ├─ Fetches GET /questions/get/{username} to get already-synced slugs
  ├─ Diffs — keeps only problems NOT already in backend
  │
  ├─ POSTs new problems to POST /api/leetcode/sync
  │   └─ Backend recounts easy/medium/hard/total and saves to User entity
  │
  └─ Automatically runs silent profile sync:
      ├─ getStreakCounter GraphQL → real streak
      ├─ recentAcSubmissionList → last 7 days → this week count
      └─ POSTs to POST /api/leetcode/sync/profile
```

---

## 🎨 Frontend Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Activity feed, sidebar with friends list and mini leaderboard |
| `/profile/me` | MyProfile | Own profile — stats, solved list, friends tab |
| `/profile/:username` | ProfilePage | Other user's profile — data gated by friendship |
| `/friends` | FriendsPage | Friends grid, leaderboard, incoming + sent requests |
| `/compare/:username` | ComparePage | Side-by-side stats, radar chart, problem overlap |
| `/stats` | StatsPage | Own analytics — ring chart, difficulty bars, activity |
| `/problems` | ProblemsPage | Browse all problems with friend solve indicators |

---

## 🔐 Security Notes

- All endpoints except `/auth/**` require `Authorization: Bearer <token>`
- CORS configured to allow `chrome-extension://*` and `http://localhost:5173`
- Passwords hashed with BCrypt
- JWT expiry: 24 hours (configurable via `jwt.expiration`)
- LeetCode credentials are **never** stored or transmitted — the extension only uses your existing LeetCode browser session

---

## 🧪 Testing

- Manual API testing with Postman
- Basic unit tests for backend services

---

## 🚧 Planned Features

### Social
- [ ] Real-time notifications
- [ ] Friend activity feed
- [ ] Friend suggestions based on common problems

### Coding
- [ ] Activity heatmap calendar
- [ ] Contest tracking
- [ ] Multi-platform sync (Codeforces, CodeChef, HackerRank)
- [ ] Topic-wise analytics deep dive
- [ ] AI-based problem recommendations

### Platform
- [ ] Mobile responsive optimization
- [ ] Profile customization
- [ ] Admin dashboard
- [ ] System design practice tracker

---

## 👤 Author

**Yatharth Singh** — Backend · Frontend · Chrome Extension

---

<div align="center">

Built with ☕, too many LeetCode problems, and a genuine hatred of solving them alone.

⭐ Star this repo if you find it useful!

</div>
