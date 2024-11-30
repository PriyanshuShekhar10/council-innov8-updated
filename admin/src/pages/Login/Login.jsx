import { useState, useEffect } from "react";
import styles from "./Login.module.css"; // Import the CSS module
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize the useNavigate hook

  useEffect(() => {
    // Check if the user is already authenticated
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API}/admin/checklogin`,
          {
            withCredentials: true,
          }
        );

        if (response.data.ok) {
          navigate("/login"); // Redirect to home page if authenticated
        }
      } catch (err) {
        console.error("Error checking login status:", err);
        // You can optionally handle this error if necessary
      }
    };

    checkLoginStatus();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API}/admin/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.ok) {
        toast.success("Login successful");
        console.log("Login successful", response.data);
        navigate("/"); // Redirect to home page after successful login
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      if (err.response) {
        toast.error(
          err.response.data.message || "An error occurred during login."
        );
      } else if (err.request) {
        toast.error("No response from server. Check your network connection.");
      } else {
        toast.error("Error setting up login request.");
      }
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <h1 className={styles["new-amsterdam-regular"]}>
          Welcome to Screencode
        </h1>
        <div className={styles.login}>
          <h1 className={styles.title + " " + styles["monospace-text"]}>
            HELLO ADMIN!
          </h1>
          <form
            className={styles["login-form"] + " " + styles["monospace-text"]}
            onSubmit={handleSubmit}
          >
            <div className={styles.email}>
              <label htmlFor="email">Email: </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={styles.password}>
              <label htmlFor="password">Password: </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              className={styles["button-47"]}
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
