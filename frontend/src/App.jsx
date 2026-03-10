import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";

import Navbar from "./components/Navbar";
import AppSidebar from "./components/layout/AppSidebar";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Home from "./Pages/Home";
import Landing from "./Pages/Landing";
import ProblemsPage from "./Pages/ProblemsPage";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import AuthRedirect from "./components/Auth/AuthRedirect";
import ProfilePage from "./Pages/ProfilePage";
import MyProfile from "./Pages/MyProfile";
import FriendsPage from "./Pages/FriendsPage";
import StatsPage from "./Pages/StatsPage";
import ComparePage    from "./Pages/ComparePage";

const token = localStorage.getItem("token");
if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

const AuthLayout = ({ children }) => (
  <div className="flex min-h-screen bg-[#0b0d13]">
    <AppSidebar />
    <div className="flex-1 ml-[220px] min-w-0">{children}</div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* ── Public ── */}
        <Route
          path="/"
          element={
            <AuthRedirect>
              <>
                <Navbar />
                <Landing />
              </>
            </AuthRedirect>
          }
        />
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <>
                <Navbar />
                <Login />
              </>
            </AuthRedirect>
          }
        />
        <Route
          path="/register"
          element={
            <AuthRedirect>
              <>
                <Navbar />
                <Register />
              </>
            </AuthRedirect>
          }
        />

        {/* ── Protected ── */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <AuthLayout>
                <Home />
              </AuthLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/problems"
          element={
            <ProtectedRoute>
              <AuthLayout>
                <ProblemsPage />
              </AuthLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/me"
          element={
            <ProtectedRoute>
              <AuthLayout>
                <MyProfile />
              </AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:username"
          element={
            <ProtectedRoute>
              <AuthLayout>
                <ProfilePage />
              </AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <AuthLayout>
                <FriendsPage />
              </AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <ProtectedRoute>
              <AuthLayout>
                <StatsPage />
              </AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/compare" element={<ProtectedRoute><AuthLayout><ComparePage /></AuthLayout></ProtectedRoute>} />
        <Route path="/compare/:username" element={<ProtectedRoute><AuthLayout><ComparePage /></AuthLayout></ProtectedRoute>} />

      </Routes>
    </Router>
  );
}

export default App;
