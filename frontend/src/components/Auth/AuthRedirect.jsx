import { Navigate } from "react-router-dom";

const AuthRedirect = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem("token");

  if (isLoggedIn) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default AuthRedirect;
