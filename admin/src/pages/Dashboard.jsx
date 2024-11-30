import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import "./Dashboard.css"; // Import CSS for styling
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import CandidatesTable from "../components/CandidatesTable"; // Import the table component
import axios from "axios";

// Register the required components for Chart.js
Chart.register(ArcElement, Tooltip, Legend);

export default function Dashboard({ adminName = "Admin" }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [shortlistedCount, setShortlistedCount] = useState(0);
  const [fraudCount, setFraudCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch shortlisted candidates
        const shortlistedResponse = await axios.get(
          "http://localhost:3000/api/shortlist"
        );
        const shortlistedIds = [
          ...new Set(shortlistedResponse.data.map((item) => item.candidateId)),
        ];

        // Batch fetch shortlisted candidates
        const shortlistedCandidates = await axios.post(
          "http://localhost:3000/api/candidates/batch",
          { ids: shortlistedIds }
        );

        const validShortlistedCount = shortlistedCandidates.data.filter(
          (candidate) =>
            candidate.work_experience[0]?.job_title &&
            candidate.work_experience[0]?.job_title.toLowerCase() !== "n/a"
        ).length;
        setShortlistedCount(validShortlistedCount);

        // Fetch fraudulent candidates
        const fraudResponse = await axios.get("http://localhost:3000/api/flag");
        const fraudIds = [
          ...new Set(fraudResponse.data.map((item) => item.candidateId)),
        ];

        // Batch fetch flagged candidates
        const fraudCandidates = await axios.post(
          "http://localhost:3000/api/candidates/batch",
          { ids: fraudIds }
        );

        const validFraudCount = fraudCandidates.data.filter(
          (candidate) =>
            candidate.work_experience[0]?.job_title &&
            candidate.work_experience[0]?.job_title.toLowerCase() !== "n/a"
        ).length;
        setFraudCount(validFraudCount);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchCounts();

    // Set up an interval to fetch counts every 10 seconds
    const intervalId = setInterval(fetchCounts, 10000); // 10 seconds interval

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const totalCandidates = 1000;
  const candidatesCount = totalCandidates - shortlistedCount - fraudCount;

  // Define the new links for the three tiles
  const links = [
    {
      path: "/reservations",
      name: `Candidates: ${candidatesCount}`,
      description: "View and manage all candidates.",
      bgColor: "#4CAF50", // Green
    },
    {
      path: "/movies",
      name: `Shortlisted: ${shortlistedCount}`,
      description: "View shortlisted candidates.",
      bgColor: "#2196F3", // Blue
    },
    {
      path: "/advertisement",
      name: `Fraudulent: ${fraudCount}`,
      description: "Manage and review fraudulent activities.",
      bgColor: "#f44336", // Red
    },
  ];

  // Define data for the pie charts
  const pieData1 = {
    labels: ["0-2 Years", "3-5 Years", "6+ Years"],
    datasets: [
      {
        data: [30, 40, 30],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  const pieData2 = {
    labels: ["Genuine", "Fraudulent"],
    datasets: [
      {
        data: [823, 177],
        backgroundColor: ["#4BC0C0", "#FF6384"],
      },
    ],
  };

  const pieData3 = {
    labels: ["JavaScript", "Python", "Java", "Others"],
    datasets: [
      {
        data: [40, 25, 20, 15],
        backgroundColor: ["#36A2EB", "#FFCE56", "#4BC0C0", "#FF6384"],
      },
    ],
  };

  return (
    <>
      <Navbar />
      <div className={`dashboard ${isDarkMode ? "dark-mode" : ""}`}>
        <button className="dark-mode-toggle" onClick={toggleDarkMode}>
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </button>
        <h1>Welcome, {adminName}!</h1>
        <p style={{ textAlign: "center", margin: "10px", fontSize: "16px" }}>
          Explore the Admin Panel to manage your tasks efficiently.
        </p>
        <div className="dashboard-grid">
          {links.map((link, index) => (
            <Link to={link.path} key={index} style={{ textDecoration: "none" }}>
              <div
                className="dashboard-tile"
                style={{ backgroundColor: link.bgColor }}
              >
                <h2 className="link-description">{link.name}</h2>
                <p className="link-description">{link.description}</p>
              </div>
            </Link>
          ))}
        </div>
        {/* Pie Charts Section */}
        <div className="pie-chart-row">
          <div className="pie-chart">
            <h3>Work Experience</h3>
            <Pie data={pieData1} />
          </div>
          <div className="pie-chart">
            <h3>Fraudulent Percentage</h3>
            <Pie data={pieData2} />
          </div>
          <div className="pie-chart">
            <h3>Top Skills by Count</h3>
            <Pie data={pieData3} />
          </div>
        </div>
        {/* Candidates Table Section */}
        <CandidatesTable />
      </div>
    </>
  );
}
