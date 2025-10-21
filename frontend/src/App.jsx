import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./components/Authentication/Auth";
import TeacherHome from "./components/Teacher-Dashboard/TeacherHome";
import StudentHome from "./components/Student-Dashboard/StudentHome";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/teacher-home" element={<TeacherHome />} />
        <Route path="/student-home" element={<StudentHome />} />
      </Routes>
    </Router>
  );
}

export default App;
