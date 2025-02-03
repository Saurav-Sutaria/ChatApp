import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import Navbar from "./components/Navbar";
import { useAuthentication } from "./context/AuthenticationContext";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";

function App() {
  const { checkAuth, user, onlineUsers } = useAuthentication();

  useEffect(() => {
    console.log("online users", onlineUsers);
    checkAuth();
  }, []);

  return (
    <div className="">
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={user ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!user ? <SignupPage /> : <Navigate to="/" />}
        />
        <Route
          path="/profile"
          element={user ? <ProfilePage /> : <Navigate to="/" />}
        />
      </Routes>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
