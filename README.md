# 🚀 AFriendlyCoding – A Social Coding Platform for Developers

AFriendlyCoding is a full-stack web platform designed to help developers track their coding progress, synchronize solved problems from LeetCode, and connect with friends to build a collaborative coding environment.
The platform combines **problem tracking**, **user profiles**, and **social networking features** to motivate consistent coding practice and peer learning.

## 📌 Project Status -> ⚙️ Actively under development
--> Current phase focuses on authentication, LeetCode problem synchronization, user profiles, and friend system.


## 🧠 Core Idea

Most coding platforms focus only on individual progress.
AFriendlyCoding adds a **social layer** where users can:

* View friends’ solved problems
* Compare progress
* Discover new problems
* Build a coding network


## 🛠 Tech Stack

### Frontend

* React.js (Vite)
* Axios
* HTML, CSS, JavaScript

### Backend

* Java 21
* Spring Boot
* Spring Security
* JWT Authentication
* JPA / Hibernate
* MySQL

### Browser Extension

* Chrome Extension (Manifest V3)
* JavaScript


## ✅ Features Implemented

### 🔐 Authentication

* User registration
* User login
* JWT-based authentication
* Protected routes

### 👤 User Profile

* View personal profile
* View other users’ profiles
* Display solved problems
* Basic user info

### 📥 LeetCode Sync

* Chrome extension to fetch solved problems
* Manual sync button
* Store solved problems in database
* Avoid duplicate problems

### 👥 Friend System

* Search users
* Send friend requests
* Accept / reject friend requests
* View friend list

### 📊 Problem Management

* Store problems
* Categorize by difficulty
* View problem lists


## 📁 Project Structure

```
AFriendlyCoding/
│
├── backend/        → Spring Boot Application
├── frontend/       → React Application
├── extension/      → Chrome Extension
└── README.md
```

## 🔄 API Overview (Sample)

| Method | Endpoint            | Description          |
| ------ | ------------------- | -------------------- |
| POST   | /api/auth/register  | Register user        |
| POST   | /api/auth/login     | Login user           |
| POST   | /api/leetcode/sync  | Sync solved problems |
| GET    | /api/users/search   | Search users         |
| POST   | /api/friends/send   | Send friend request  |
| POST   | /api/friends/accept | Accept request       |

## 🧪 Testing

* Manual API testing using Postman
* Basic unit tests for backend


## 🚧 Future Scope (Planned Features)

### 🔹 Social Features

* Real-time chat between friends
* Notifications system
* Friend suggestions

### 🔹 Coding Features

* Daily coding streaks
* Contest tracking
* Multi-platform sync (Codeforces, HackerRank, CodeChef)
* Topic-wise analytics
* Difficulty-wise progress charts

### 🔹 UI/UX

* Dark mode
* Profile customization
* Mobile responsive optimization

### 🔹 Advanced

* AI-based problem recommendations
* System design practice tracker
* Admin dashboard


## 🤝 Contributors

* Yatharth Singh (Backend, Frontend, Extension)
