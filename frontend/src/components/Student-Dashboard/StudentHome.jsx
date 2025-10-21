import React, { useState, useEffect } from "react";
import "./StudentHome.css";
import Navbar from "../Navbar/Navbar";

export default function StudentHome() {
  const [loggedInUser, setLoggedInUser] = useState("");
  const [formData, setFormData] = useState({
    achievementName: "",
    position: "",
    description: "",
    date: "",
    category: "",
    teacherUsername: "",
    certificate: null,
  });

  useEffect(() => {
    // Get username from localStorage when component mounts
    const username = localStorage.getItem("username") || "";
    setLoggedInUser(username);
    
    if (!username) {
      alert("You are not logged in. Redirecting to login page.");
      window.location.href = "/login";
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username");
    alert("You have been logged out!");
    window.location.href = "/";
  };

  // handle text inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle file input
  const handleFileChange = (e) => {
    setFormData({ ...formData, certificate: e.target.files[0] });
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loggedInUser) {
      alert("You must be logged in to submit an achievement");
      return;
    }

    const data = new FormData();
    data.append("achievementName", formData.achievementName);
    data.append("position", formData.position);
    data.append("description", formData.description);
    data.append("date", formData.date);
    data.append("category", formData.category);
    data.append("teacherUsername", formData.teacherUsername);
    data.append("studentUsername", loggedInUser); // ✅ Add studentUsername to FormData
    
    if (formData.certificate) {
      data.append("certificate", formData.certificate);
    }

    try {
      const res = await fetch("http://localhost:5000/student/achievement", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (res.ok) {
        alert("Achievement submitted successfully!");
        // Reset form
        setFormData({
          achievementName: "",
          position: "",
          description: "",
          date: "",
          category: "",
          teacherUsername: "",
          certificate: null,
        });
      } else {
        alert("❌ Error: " + result.error);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("❌ Failed to connect to backend");
    }
  };

  return (
    <div>
      <Navbar onLogout={handleLogout} />
      <div className="student-container">
        <div className="student-box">
          <h2>Achievement Submission Form</h2>
          <p>Fill out your achievement details below</p>
          <p>Logged in as: <strong>{loggedInUser}</strong></p>

          <form className="student-form" onSubmit={handleSubmit}>
            <label>Achievement Name</label>
            <input
              type="text"
              name="achievementName"
              placeholder="Enter achievement name"
              value={formData.achievementName}
              onChange={handleChange}
              required
            />

            <label>Position / Rank</label>
            <input
              type="text"
              name="position"
              placeholder="e.g., 1st Place, Runner-up, Gold Medal, Winner"
              value={formData.position}
              onChange={handleChange}
              required
            />

            <label>Description</label>
            <textarea
              name="description"
              placeholder="Brief description of the achievement"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
            ></textarea>

            <label>Date of Achievement</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />

            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Category --</option>
              <option value="Academic">Academic</option>
              <option value="Sports">Sports</option>
              <option value="Cultural">Cultural</option>
              <option value="Technical">Technical</option>
              <option value="Other">Other</option>
            </select>

            <label>Upload Certificate</label>
            <input
              type="file"
              name="certificate"
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.pdf"
              required
            />

            <label>Teacher Username</label>
            <input
              type="text"
              name="teacherUsername"
              placeholder="Enter teacher's username"
              value={formData.teacherUsername}
              onChange={handleChange}
              required
            />

            <button type="submit">Submit Achievement</button>
          </form>
        </div>
      </div>
    </div>   
  );
}