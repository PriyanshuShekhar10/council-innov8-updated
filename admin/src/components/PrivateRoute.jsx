import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    console.log("before check auth value", isAuthenticated);
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API}/admin/checklogin`,
          {
            method: "GET",
            credentials: "include", // This is equivalent to `withCredentials: true` in Axios
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        if (data.ok) {
          setIsAuthenticated(true);
          console.log("after check auth value", isAuthenticated);
        }
      } catch (err) {
        console.error("Error checking login status:", err);
      } finally {
        setLoading(false); // Set loading to false after checking status
      }
    };
    checkLoginStatus();
  }, [isAuthenticated]);

  if (loading) {
    return <div>Loading...</div>; // Show a loading message or spinner
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
