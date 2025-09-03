import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmployeeStores from "./pages/EmployeeStores"; // 👈 add this

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/stores" element={<EmployeeStores />} /> {/* 👈 new route */}
      </Routes>
    </Router>
  );
}

export default App;
