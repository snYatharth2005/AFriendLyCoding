import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";

import Navbar from "./components/Navbar";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Home from "./Pages/Home";
import Landing from "./Pages/Landing";

import ProtectedRoute from "./components/Auth/ProtectedRoute";
import AuthRedirect from "./components/Auth/AuthRedirect";
import ProfilePage from "./Pages/ProfilePage";
import MyProfile from "./Pages/MyProfile";
import FriendsPage from "./Pages/FriendsPage";

function App() {
  const token = localStorage.getItem("token");

  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  return (
    <Router>
      <Navbar />

      <Routes>
        {/* Landing */}
        <Route
          path="/"
          element={
            <AuthRedirect>
              <Landing />
            </AuthRedirect>
          }
        />

        {/* Auth */}
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <Login />
            </AuthRedirect>
          }
        />

        <Route
          path="/register"
          element={
            <AuthRedirect>
              <Register />
            </AuthRedirect>
          }
        />

        {/* Protected */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/profile/me"
          element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/:username"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/friends"
          element={
            <ProtectedRoute>
              <FriendsPage />
            </ProtectedRoute>
          } />


      </Routes>
    </Router>
  );
}

export default App;
