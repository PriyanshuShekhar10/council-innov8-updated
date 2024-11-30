import { BrowserRouter, Route, Routes } from "react-router-dom";
import Cinema from "./pages/Cinema";
import Advertisement from "./pages/Advertisement";
import Dashboard from "./pages/Dashboard";
import Reservations from "./pages/Reservations";
import Users from "./pages/Users";
import Movies from "./pages/Movies";
import SidebarComponent from "./components/SidebarComponent";
import Login from "./pages/Login/Login";
import ShortlistedCandidatesTable from "./components/ShortlistedCandidatesTable";
import FraudulentCandidatesTable from "./components/FraudulentCandidatesTable";
import "./App.css";
import CandidatesTable from "./components/CandidatesTable";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route without Sidebar */}
        <Route path="/login" element={<Login />} />
        {/* All other routes with Sidebar */}
        <Route
          path="*"
          element={
            <SidebarComponent>
              <Routes>
                <Route path="/advertisement" element={<FraudulentCandidatesTable />} />
                <Route path="/cinema" element={<Cinema />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/movies" element={<ShortlistedCandidatesTable />} />
                <Route path="/reservations" element={<CandidatesTable />} />
                <Route path="/candidates/:id" element={<Users />} />
              </Routes>
            </SidebarComponent>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
