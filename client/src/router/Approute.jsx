import { Route, Routes, Navigate } from "react-router-dom";
import Login from "../pages/Login.jsx";
import Signup from "../pages/Signup.jsx";
import DashBoard from "../pages/DashBoard.jsx";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContex.jsx";

const Approute = () => {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" /> : <Login />}
      />

      <Route path="/sign-up" element={user ?< Navigate to="/"/>:<Signup />} />

      <Route
        path="/"
        element={user ? <DashBoard /> : <Navigate to="/login" />}
      />
    </Routes>
  );
};

export default Approute;
