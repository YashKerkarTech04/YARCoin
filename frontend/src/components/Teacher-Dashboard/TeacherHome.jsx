import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TeacherHome.css';
import TeacherNavbar from "../Navbar/TeacherNavbar";

const TeacherHome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState([]);  
  const [teachers, setTeachers] = useState([]); 
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [bidMessage, setBidMessage] = useState({ text: '', type: '' }); // Add this state


  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // setLoading(true);
      // console.log("🔄 Fetching data from backend...");

      const baseUrl = "https://winona-errable-raphael.ngrok-free.dev/api";

      // ✅ Fetch students
      const studentsResponse = await fetch(`${baseUrl}/students`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!studentsResponse.ok)
        throw new Error(`Failed to fetch students (Status: ${studentsResponse.status})`);

      const studentsData = await studentsResponse.json();

      // ✅ Fetch teachers
      const teachersResponse = await fetch(`${baseUrl}/teachers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!teachersResponse.ok)
        throw new Error(`Failed to fetch teachers (Status: ${teachersResponse.status})`);

      const teachersData = await teachersResponse.json();

      // console.log("✅ Students data:", studentsData);
      // console.log("✅ Teachers data:", teachersData);

      // ✅ Identify current teacher
       // ✅ Identify current teacher - FIXED APPROACH
      let currentTeacherData = null;

      // Method 1: Check if teacher data was passed via navigation state
      if (location.state && location.state.email) {
        // console.log("📍 Finding teacher from navigation state...");
        currentTeacherData = teachersData.find(
          (teacher) => teacher.email === location.state.email
        );
      }

      // Method 2: Check localStorage for logged-in teacher
      if (!currentTeacherData) {
        const storedUserEmail = localStorage.getItem("userEmail");
        const storedUserName = localStorage.getItem("userName");
        console.log("📍 Finding teacher from localStorage:", { storedUserEmail, storedUserName });
        
        if (storedUserEmail) {
          currentTeacherData = teachersData.find(
            (teacher) => teacher.email === storedUserEmail
          );
        }
      }

      // Method 3: If still not found, use the first teacher as fallback (for testing)
      if (!currentTeacherData && teachersData.length > 0) {
        console.log("⚠️ Using first teacher as fallback");
        currentTeacherData = teachersData[0];
      }

      console.log("👨‍🏫 Current teacher identified:", currentTeacherData);

    

      setStudents(studentsData);
      setTeachers(teachersData);
      setCurrentTeacher(currentTeacherData);
    } catch (error) {
      console.error("❌ Error fetching data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Process student data for display
  const processStudentForDisplay = (student) => ({
    id: student._id,
    name: student.name,
    email: student.email,
    skills: student.skills || ['Skills not specified'],
    achievements: student.achievements || ['Achievements not specified'],
    currentBid: student.yarCoins || 0,
    currentTeacher: student.ownedBy?.name || null,
    basePrice: student.basePrice || 30,
    isAvailable: !student.ownedBy,
  });

  const getTeacherNameById = (teacherId) => {
  const teacher = teachers.find(t => t._id === teacherId);
  return teacher?.name || 'Unknown Teacher';
};

  // 🔹 Process teacher data for display
  const processTeacherForDisplay = (teacher) => ({
    id: teacher._id,
    name: teacher.name,
    email: teacher.email,
    specialization: teacher.specialization || 'Not specified',
    purse: teacher.purse || 10001,
  });

  const handleBid = async (studentId) => {
    const amount = parseInt(bidAmount);
    if (!amount || amount <= 0) {
      setBidMessage({ text: 'Please enter a valid bid amount', type: 'error' });
      setTimeout(() => setBidMessage({ text: '', type: '' }), 2000);
      return;
    }

    const student = students.find((s) => s._id === studentId);
    if (!student) {
      setBidMessage({ text: 'Student not found', type: 'error' });
      setTimeout(() => setBidMessage({ text: '', type: '' }), 2000);
      return;
    }

    if (!currentTeacher) {
      setBidMessage({ text: 'Teacher not found', type: 'error' });
      setTimeout(() => setBidMessage({ text: '', type: '' }), 2000);
      return;
    }

    if (amount > (currentTeacher.purse || 10000)) {
      setBidMessage({ 
        text: `Insufficient YARCoin in purse. You have ${currentTeacher.purse || 0} YARCoins`, 
        type: 'error' 
      });
      setTimeout(() => setBidMessage({ text: '', type: '' }), 2000);
      return;
    }

    try {
      const response = await fetch(
        `https://winona-errable-raphael.ngrok-free.dev/api/biddings`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teacherId: currentTeacher._id,
            studentId: selectedStudent.id,
            bidAmount: amount,
          }),
        }
      );

      console.log("Current Teacher:",currentTeacher);
      console.log("Current Student:",selectedStudent);
      console.log('Current Amount:', amount);

      const result = await response.json();
      console.log("Result:",result);

      if (response.ok) {
        setBidMessage({ text: 'Bid Successful', type: 'success' });
        setTimeout(() => {
          setBidMessage({ text: '', type: '' });
          fetchInitialData();
          setBidAmount('');
          setSelectedStudent(null);
        }, 2000);
      } else {
        setBidMessage({ text: `${result.message}`, type: 'error' });
        setTimeout(() => setBidMessage({ text: '', type: '' }), 2000);
      }


    } catch (error) {
      console.error('Error placing bid:', error);
      if (error.message.includes('Failed to fetch')) {
        setBidMessage({ text: '❌ Bidding endpoint not available yet', type: 'error' });
      } else {
        setBidMessage({ text: '❌ Error placing bid', type: 'error' });
      }
      setTimeout(() => setBidMessage({ text: '', type: '' }), 2000);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    alert('Logged out successfully!');
    navigate('/');
  };

  if (loading) {
    return (
      <>
        <TeacherNavbar onLogout={handleLogout} />
        <div className="loading-container">
          <div className="loading-spinner">
            <h3>Loading YARCoin Bidding System...</h3>
            <p>Connecting to friend&apos;s backend server...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TeacherNavbar onLogout={handleLogout} />
      <div className="bidding-system">
        <header className="bidding-header">
          <h1>YARCoin Bidding System</h1>
          <p>Welcome, {currentTeacher?.name || 'Teacher'} 👨‍🏫</p>
          <p className="teacher-email">{currentTeacher?.email}</p>
          <p className="teacher-balance">
            Your YARCoin Balance: <strong>{currentTeacher?.purse || 10000} YARCoins</strong>
          </p>
        </header>

        {/* Add the bid message display here */}
        {bidMessage.text && (
          <div className={`bid-result-message ${bidMessage.type}`}>
            {bidMessage.text}
          </div>
        )}


        <div className="bidding-container">
          {/* Students Section */}
          <section className="students-section">
            <h2>Available Students for Bidding ({students.filter((s) => !s.ownedBy).length})</h2>
            <div className="students-grid">
              {students.map((student) => {
                const displayStudent = processStudentForDisplay(student);
                return (
                  <div
                    key={displayStudent.id}
                    className={`student-card ${!displayStudent.isAvailable ? 'acquired' : ''}`}
                  >


                    <div className="student-info">
                      <h3>{displayStudent.name}</h3>
                      <p className="student-email">{displayStudent.email}</p>
                      <div className="skills">
                        {displayStudent.skills.map((skill, index) => (
                          <span key={index} className="skill-tag">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="bid-info">
                        <p className="base-price">
                          Base Price: <strong>{displayStudent.basePrice} YARCoin</strong>
                        </p>
                        <p className="current-bid">
                          Earned YARCoins: <strong>{displayStudent.currentBid} YARCoin</strong>
                        </p>
                        <p className="current-teacher">
                          Status:{' '}
                          <strong>
                            {student.ownedBy
                              ? `Acquired by ${getTeacherNameById(student.ownedBy)}`
                              : 'Available'}
                          </strong>
                        </p>
                      </div>
                    </div>

                    {displayStudent.isAvailable ? (
                      <button
                        className="bid-button"
                        onClick={() => setSelectedStudent(displayStudent)}
                      >
                        Place Bid
                      </button>
                    ) : (
                      <button className="bid-button acquired" disabled>
                        Already Acquired
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Teachers Section */}
          <section className="teachers-section">
            <h2>Teachers & Current Holdings ({teachers.length})</h2>
            <div className="teachers-list">
              {teachers.map((teacher) => {
                const displayTeacher = processTeacherForDisplay(teacher);
                return (
                  <div key={displayTeacher.id} className="teacher-card">
                    <div className="teacher-header">
                      <h3>{displayTeacher.name}</h3>
                      <span className="purse-amount">{displayTeacher.purse} YARCoin</span>
                    </div>
                    <p className="teacher-email">{displayTeacher.email}</p>
                    <p className="teacher-specialization">
                      {displayTeacher.specialization}
                    </p>
                    <div className="current-holdings">
                      <h4>Teacher Profile</h4>
                      <p className="no-holdings">
                        {displayTeacher.name === currentTeacher?.name
                          ? 'Your profile - Ready to bid on students!'
                          : 'Other teacher in system'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Bid Modal */}
        {selectedStudent && (
          <div className="modal-overlay">
            <div className="bid-modal">
              <h2>Place Bid for {selectedStudent.name}</h2>
              <div className="bid-details">
                <p>
                  Base Price: <strong>{selectedStudent.basePrice} YARCoin</strong>
                </p>
                <p>
                  Current Earnings: <strong>{selectedStudent.currentBid} YARCoin</strong>
                </p>
                <p>
                  Status:{' '}
                  <strong>
                    {selectedStudent.currentTeacher
                      ? `Acquired by ${selectedStudent.currentTeacher}`
                      : 'Available'}
                  </strong>
                </p>
                <p>
                  Your Balance: <strong>{currentTeacher?.purse || 10000} YARCoin</strong>
                </p>
              </div>
              <div className="bid-input-group">
                <label htmlFor="bidAmount">Your Bid Amount (YARCoin):</label>
                <input
                  type="number"
                  id="bidAmount"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Enter amount at least ${selectedStudent.basePrice}`}
                  min={selectedStudent.basePrice}
                />
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setSelectedStudent(null)}>
                  Cancel
                </button>
                <button
                  className="confirm-bid-btn"
                  onClick={() => handleBid(selectedStudent.id)}
                  // disabled={!bidAmount || parseInt(bidAmount) < selectedStudent.basePrice}
                >
                  Confirm Bid
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TeacherHome;
