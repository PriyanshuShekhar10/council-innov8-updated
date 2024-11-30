import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TableStyles.css"; // Assuming you have a CSS file for table styles
import candidateData from "../Data/Resume.candidates.json"; // Import the candidates' JSON data

const ShortlistedCandidatesTable = () => {
  const [shortlistedCandidates, setShortlistedCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);

  useEffect(() => {
    const fetchShortlistedCandidates = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/shortlist");
        const uniqueIds = [
          ...new Set(response.data.map((item) => item.candidateId)),
        ];

        const candidatesPromises = uniqueIds.map((id) =>
          axios.get(`http://localhost:3000/api/candidates/${id}`)
        );
        const candidatesResponses = await Promise.all(candidatesPromises);

        const candidates = candidatesResponses
          .map((res) => res.data)
          .filter(
            (candidate) =>
              candidate.work_experience &&
              candidate.work_experience.length > 0 &&
              candidate.work_experience[0].job_title &&
              candidate.work_experience[0].job_title.toLowerCase() !== "n/a"
          );

        setShortlistedCandidates(candidates);
      } catch (error) {
        console.error("Error fetching shortlisted candidates:", error);
      }
    };

    fetchShortlistedCandidates();
  }, []);

  const handleCheckboxChange = (candidateId) => {
    setSelectedCandidates((prev) => {
      if (prev.includes(candidateId)) {
        return prev.filter((id) => id !== candidateId);
      } else {
        return [...prev, candidateId];
      }
    });
  };

  const handleCompare = () => {
    if (selectedCandidates.length !== 2) {
      alert("Please select exactly 2 candidates to compare.");
      return;
    }

    // Fetch detailed data for the selected candidates from the JSON file
    const candidate1 = candidateData.find(
      (c) => c.id === selectedCandidates[0]
    );
    const candidate2 = candidateData.find(
      (c) => c.id === selectedCandidates[1]
    );

    setComparisonData({ candidate1, candidate2 });
  };

  return (
    <div className="table-container">
      <h2>Shortlisted Candidates</h2>
      <table className="candidates-table">
        <thead>
          <tr>
            <th>Select</th> {/* New column for checkboxes */}
            <th>Id No</th>
            <th>Name</th>
            <th>Latest Job Title</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shortlistedCandidates.map((candidate) => (
            <tr key={candidate.id}>
              <td>
                <input
                  type="checkbox"
                  onChange={() => handleCheckboxChange(candidate.id)}
                  checked={selectedCandidates.includes(candidate.id)}
                />
              </td>
              <td>{candidate.id}</td>
              <td>Dummy Name</td> {/* Placeholder name */}
              <td>{candidate.work_experience?.[0]?.job_title || "N/A"}</td>
              <td>
                <button
                  className="action-button move-back"
                  onClick={() => handleMoveBack(candidate.id)}
                >
                  Move Back
                </button>
                <button
                  className="action-button remove"
                  onClick={() => handleRemoveFromProcess(candidate.id)}
                >
                  Remove
                </button>
                <button
                  className="action-button interview"
                  onClick={() => handleMoveToInterview(candidate.id)}
                >
                  Move to Interview
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Compare button outside the table */}
      <div className="compare-container" style={{ marginTop: "20px" }}>
        <button
          className="action-button compare"
          onClick={handleCompare}
          disabled={selectedCandidates.length !== 2} // Disable unless exactly 2 selected
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          Compare Selected Candidates
        </button>
      </div>

      {/* Display comparison results */}
      {comparisonData && (
        <div className="comparison-container" style={{ marginTop: "40px" }}>
          <h3
            style={{
              textAlign: "center",
              marginBottom: "20px",
              color: "#007BFF",
            }}
          >
            Comparison Results
          </h3>
          <div
            className="candidate-comparison"
            style={{ display: "flex", justifyContent: "space-around" }}
          >
            <div
              style={{
                border: "1px solid #ccc",
                padding: "20px",
                borderRadius: "10px",
                width: "45%",
                backgroundColor: "#e9ecef",
              }}
            >
              <h4
                style={{
                  borderBottom: "2px solid #007BFF",
                  paddingBottom: "10px",
                  marginBottom: "20px",
                  color: "#007BFF",
                }}
              >
                Candidate 1
              </h4>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td
                      style={{
                        padding: "8px",
                        fontWeight: "bold",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      ID
                    </td>
                    <td style={{ padding: "8px", backgroundColor: "#ffffff" }}>
                      {comparisonData.candidate1.id}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "8px",
                        fontWeight: "bold",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      Name
                    </td>
                    <td style={{ padding: "8px", backgroundColor: "#ffffff" }}>
                      {comparisonData.candidate1.name}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "8px",
                        fontWeight: "bold",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      Job Title
                    </td>
                    <td style={{ padding: "8px", backgroundColor: "#ffffff" }}>
                      {comparisonData.candidate1.work_experience[0]?.job_title}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "8px",
                        fontWeight: "bold",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      Education
                    </td>
                    <td style={{ padding: "8px", backgroundColor: "#ffffff" }}>
                      {comparisonData.candidate1.education
                        ?.map((ed) => ed.degree)
                        .join(", ")}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "8px",
                        fontWeight: "bold",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      Skills
                    </td>
                    <td style={{ padding: "8px", backgroundColor: "#ffffff" }}>
                      {comparisonData.candidate1.skills?.join(", ")}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "8px",
                        fontWeight: "bold",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      Experience
                    </td>
                    <td style={{ padding: "8px", backgroundColor: "#ffffff" }}>
                      {comparisonData.candidate1.work_experience
                        ?.map((we) => `${we.job_title} at ${we.company}`)
                        .join(", ")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div
              style={{
                border: "1px solid #ccc",
                padding: "20px",
                borderRadius: "10px",
                width: "45%",
                backgroundColor: "#e9ecef",
              }}
            >
              <h4
                style={{
                  borderBottom: "2px solid #007BFF",
                  paddingBottom: "10px",
                  marginBottom: "20px",
                  color: "#007BFF",
                }}
              >
                Candidate 2
              </h4>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td
                      style={{
                        padding: "8px",
                        fontWeight: "bold",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      ID
                    </td>
                    <td style={{ padding: "8px", backgroundColor: "#ffffff" }}>
                      {comparisonData.candidate2.id}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "8px",
                        fontWeight: "bold",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      Name
                    </td>
                    <td style={{ padding: "8px", backgroundColor: "#ffffff" }}>
                      {comparisonData.candidate2.name}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "8px",
                        fontWeight: "bold",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      Job Title
                    </td>
                    <td style={{ padding: "8px", backgroundColor: "#ffffff" }}>
                      {comparisonData.candidate2.work_experience[0]?.job_title}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "8px",
                        fontWeight: "bold",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      Education
                    </td>
                    <td style={{ padding: "8px", backgroundColor: "#ffffff" }}>
                      {comparisonData.candidate2.education
                        ?.map((ed) => ed.degree)
                        .join(", ")}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "8px",
                        fontWeight: "bold",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      Skills
                    </td>
                    <td style={{ padding: "8px", backgroundColor: "#ffffff" }}>
                      {comparisonData.candidate2.skills?.join(", ")}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "8px",
                        fontWeight: "bold",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      Experience
                    </td>
                    <td style={{ padding: "8px", backgroundColor: "#ffffff" }}>
                      {comparisonData.candidate2.work_experience
                        ?.map((we) => `${we.job_title} at ${we.company}`)
                        .join(", ")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShortlistedCandidatesTable;
