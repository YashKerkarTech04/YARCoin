import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Auth() {
  const [tab, setTab] = useState("register"); 
  const [role, setRole] = useState("student"); // role selection only for registration
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  // form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    confirmPassword: ""
  });

  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });

  // handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message.text) setMessage({ text: "", type: "" });
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    if (message.text) setMessage({ text: "", type: "" });
  };

  // show message helper
  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  // submit register form
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (formData.password !== formData.confirmPassword) {
      showMessage("Passwords do not match!", "error");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      showMessage("Password must be at least 6 characters long!", "error");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          password: formData.password,
          role: role,
        }),
      });
      const data = await res.json();

      if(!res.ok){
        showMessage("Error: " + data.error, "error");
        return;
      }
      
      showMessage("Registered successfully!", "success");
      setTab("login"); // switch to login after registration
      
      // Clear form
      setFormData({
        firstName: "",
        lastName: "",
        username: "",
        password: "",
        confirmPassword: ""
      });
    } catch (err) {
      console.error("Error:", err);
      showMessage("Failed to connect to backend", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // submit login form
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showMessage("" + (data.error || "Login failed"), "error");
        return;
      }

      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);

      showMessage("🎉 Login successful! Redirecting...", "success");

      // Navigate based on backend role
      setTimeout(() => {
        if (data.role === "teacher") {
          navigate("/teacher-home", { state: { username: data.username } });
        } else if (data.role === "student") {
          navigate("/student-home", { state: { username: data.username } });
        } else {
          showMessage("Invalid role received from backend", "error");
        }
      }, 1000);

    } catch (err) {
      console.error("Error:", err);
      showMessage("Failed to connect to backend", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator (optional feature)
  const getPasswordStrength = (password) => {
    if (password.length === 0) return { text: "", className: "" };
    if (password.length < 6) return { text: "Weak", className: "weak" };
    if (password.length < 8) return { text: "Medium", className: "medium" };
    return { text: "Strong", className: "strong" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{tab === "login" ? "Welcome Back" : "Join YARCoin"}</h2>
        <p>
          {tab === "login"
            ? "Sign in to your YARCoin account"
            : `Register as a ${role}`}
        </p>

        {/* Display Messages */}
        {message.text && (
          <div className={`auth-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Role Toggle - only for registration */}
        {tab === "register" && (
          <div className="role-toggle">
            <button
              type="button"
              className={role === "student" ? "active" : ""}
              onClick={() => setRole("student")}
            >
               Student
            </button>
            <button
              type="button"
              className={role === "teacher" ? "active" : ""}
              onClick={() => setRole("teacher")}
            >
               Teacher
            </button>
          </div>
        )}

        {/* Login Form */}
        {tab === "login" && (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={loginData.username}
                onChange={handleLoginChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
                disabled={isLoading}
              />
            </div>

            <p className="signup-text">
              Don't have an account?{" "}
              <span onClick={() => !isLoading && setTab("register")}>Sign up</span>
            </p>

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Login to YARCoin"}
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === "register" && (
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="name-fields">
              <div className="input-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="input-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password (min. 6 characters)"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              {formData.password && (
                <div className={`password-strength ${passwordStrength.className}`}>
                  {passwordStrength.text}
                </div>
              )}
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <p className="signup-text">
              Already have an account?{" "}
              <span onClick={() => !isLoading && setTab("login")}>Login</span>
            </p>

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Creating Account..." : `Register as ${role}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}