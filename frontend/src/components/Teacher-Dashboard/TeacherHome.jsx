import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 import for navigation
import './TeacherHome.css';
import TeacherNavbar from "../Navbar/TeacherNavbar";

const TeacherHome = () => {
  const navigate = useNavigate(); // initialize navigation hook

  const handleLogout = () => {
    alert('Logged out successfully!');
    navigate('/'); // redirects to homepage (Auth.js)
  };

  // Dummy data - will be replaced with backend data later
  const initialStudents = [
    { id: 1, name: 'Ankit Bari', skills: ['React', 'Node.js', 'Blockchain'], currentBid: 50, currentTeacher: 'Dr. Tatwadarshi Nagarhalli', basePrice: 30 },
    { id: 2, name: 'Yash Kerkar', skills: ['Python', 'AI/ML', 'Solidity'], currentBid: 0, currentTeacher: null, basePrice: 40 },
    { id: 3, name: 'Rahul Singh', skills: ['Java', 'Spring Boot', 'Web3'], currentBid: 35, currentTeacher: 'Mrs. Sejal D Mello', basePrice: 25 },
    { id: 4, name: 'Saurabh Vishwakarma', skills: ['JavaScript', 'React', 'Smart Contracts'], currentBid: 0, currentTeacher: null, basePrice: 35 },
    { id: 5, name: 'Harsh Tripathi', skills: ['Vue.js', 'MongoDB', 'DApps'], currentBid: 45, currentTeacher: 'Ms. Neha Raut', basePrice: 30 }
  ];

  const initialTeachers = [
    { id: 1, name: 'Dr. Tatwadarshi Nagarhalli', purse: 200, currentBids: [1] },
    { id: 2, name: 'Mrs. Sejal D Mello', purse: 150, currentBids: [3] },
    { id: 3, name: 'Ms. Neha Raut', purse: 180, currentBids: [5] },
    { id: 4, name: 'Prof. Raunak Joshi', purse: 220, currentBids: [] }
  ];

  const [students, setStudents] = useState(initialStudents);
  const [teachers, setTeachers] = useState(initialTeachers);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [currentTeacher, setCurrentTeacher] = useState('Prof. Raunak Joshi'); // Simulated logged-in teacher

  useEffect(() => {
    // Later: fetch from backend
  }, []);

  const handleBid = (studentId) => {
    const amount = parseInt(bidAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid bid amount');
      return;
    }

    const student = students.find(s => s.id === studentId);
    const teacher = teachers.find(t => t.name === currentTeacher);

    if (!teacher) {
      alert('Teacher not found');
      return;
    }

    if (amount <= student.currentBid) {
      alert(`Bid must be higher than current bid of ${student.currentBid} YARCoin`);
      return;
    }

    if (amount > teacher.purse) {
      alert('Insufficient YARCoin in purse');
      return;
    }

    // Step 1: Remove student from any previous teacher
    const prevTeacher = teachers.find(t => t.currentBids.includes(studentId));
    const teachersAfterRemoval = teachers.map(t =>
      t.id === prevTeacher?.id
        ? { ...t, currentBids: t.currentBids.filter(id => id !== studentId) }
        : t
    );

    // Step 2: Update current teacher’s purse and bids
    const updatedTeachers = teachersAfterRemoval.map(t =>
      t.name === currentTeacher
        ? {
            ...t,
            purse: t.purse - amount,
            currentBids: [...t.currentBids, studentId],
          }
        : t
    );

    // Step 3: Update student list
    const updatedStudents = students.map(s =>
      s.id === studentId
        ? { ...s, currentBid: amount, currentTeacher: currentTeacher }
        : s
    );

    setStudents(updatedStudents);
    setTeachers(updatedTeachers);
    setBidAmount('');
    setSelectedStudent(null);
    alert(`Successfully bid ${amount} YARCoin for ${student.name}`);
  };

  const getTeacherByName = (teacherName) => {
    return teachers.find(t => t.name === teacherName);
  };

  return (
  <>
   <TeacherNavbar onLogout={handleLogout} />
    <div className="bidding-system">

      <header className="bidding-header">
        <h1>YARCoin Bidding System</h1>
        <p>Welcome, {currentTeacher}</p>
      </header>

      <div className="bidding-container">
        {/* Students List Section */}
        <section className="students-section">
          <h2>Available Students for Bidding</h2>
          <div className="students-grid">
            {students.map(student => (
              <div key={student.id} className="student-card">
                <div className="student-info">
                  <h3>{student.name}</h3>
                  <div className="skills">
                    {student.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                  <div className="bid-info">
                    <p className="current-bid">Current Bid: <strong>{student.currentBid} YARCoin</strong></p>
                    <p className="current-teacher">
                      Held by: <strong>{student.currentTeacher || 'No one'}</strong>
                    </p>
                    <p className="base-price">Base Price: {student.basePrice} YARCoin</p>
                  </div>
                </div>
                <button 
                  className="bid-button"
                  onClick={() => setSelectedStudent(student)}
                >
                  Place Bid
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Teachers Purse Section */}
        <section className="teachers-section">
          <h2>Teachers Purse & Current Holdings</h2>
          <div className="teachers-list">
            {teachers.map(teacher => (
              <div key={teacher.id} className="teacher-card">
                <div className="teacher-header">
                  <h3>{teacher.name}</h3>
                  <span className="purse-amount">{teacher.purse} YARCoin</span>
                </div>
                <div className="current-holdings">
                  <h4>Currently Bidding On:</h4>
                  {teacher.currentBids.length > 0 ? (
                    <ul>
                      {teacher.currentBids.map(studentId => {
                        const student = students.find(s => s.id === studentId);
                        return student ? (
                          <li key={studentId} className="holding-item">
                            {student.name} - {student.currentBid} YARCoin
                          </li>
                        ) : null;
                      })}
                    </ul>
                  ) : (
                    <p className="no-holdings">No current bids</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bid Modal */}
      {selectedStudent && (
        <div className="modal-overlay">
          <div className="bid-modal">
            <h2>Place Bid for {selectedStudent.name}</h2>
            <div className="bid-details">
              <p>Current Bid: <strong>{selectedStudent.currentBid} YARCoin</strong></p>
              <p>Current Holder: <strong>{selectedStudent.currentTeacher || 'None'}</strong></p>
              <p>Your Purse: <strong>{getTeacherByName(currentTeacher)?.purse || 0} YARCoin</strong></p>
            </div>
            <div className="bid-input-group">
              <label htmlFor="bidAmount">Your Bid Amount (YARCoin):</label>
              <input
                type="number"
                id="bidAmount"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={`Enter amount more than ${selectedStudent.currentBid}`}
                min={selectedStudent.currentBid + 1}
              />
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setSelectedStudent(null)}
              >
                Cancel
              </button>
              <button 
                className="confirm-bid-btn"
                onClick={() => handleBid(selectedStudent.id)}
                disabled={!bidAmount || parseInt(bidAmount) <= selectedStudent.currentBid}
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
