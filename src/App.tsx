import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import TrainerDashboard from "./pages/TrainerDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import SoloDashboard from "./pages/SoloDashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/trainer" element={<TrainerDashboard />} />
        <Route path="/client" element={<ClientDashboard />} />
        <Route path="/solo" element={<SoloDashboard />} />
        {/* Redirect legacy /dashboard route to Trainer view */}
        <Route path="/dashboard" element={<Navigate to="/trainer" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
