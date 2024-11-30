import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TableStyles.css"; // Assuming you have a CSS file for table styles
import candidateData from "../Data/Resume.candidates.json"; // Import the candidates' JSON data

const ShortlistedCandidatesTable = () => {
  const [shortlistedCandidates, setShortlistedCandidates] = useState([]);

  useEffect(() => {
    const fetchShortlistedCandidates = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/shortlist");
        const uniqueIds = [
          ...new Set(response.data.map((item) => item.candidateId)),
        ];

        const candidates = uniqueIds
          .map((id) => candidateData.find((candidate) => candidate.id === id))
          .filter(
            (candidate) => candidate && candidate.work_experience[0]?.job_title
          );

        setShortlistedCandidates(candidates);
      } catch (error) {
        console.error("Error fetching shortlisted candidates:", error);
      }
    };

    fetchShortlistedCandidates();
  }, []);

  const handleMoveBack = async (candidateId) => {
    try {
      await axios.delete(`http://localhost:3000/api/shortlist/${candidateId}`);
      setShortlistedCandidates((prev) =>
        prev.filter((candidate) => candidate.id !== candidateId)
      );
    } catch (error) {
      console.error("Error moving candidate back:", error);
    }
  };

  const handleRemoveFromProcess = async (candidateId) => {
    try {
      await axios.delete(`http://localhost:3000/api/candidates/${candidateId}`);
      setShortlistedCandidates((prev) =>
        prev.filter((candidate) => candidate.id !== candidateId)
      );
    } catch (error) {
      console.error("Error removing candidate from process:", error);
    }
  };

  const handleMoveToInterview = (candidateId) => {
    console.log(`Moving candidate ${candidateId} to interview round.`);
  };

  return (
    <div className="table-container">
      <h2>Shortlisted Candidates</h2>
      <table className="candidates-table">
        <thead>
          <tr>
            <th>Id No</th>
            <th>Name</th>
            <th>Latest Job Title</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shortlistedCandidates.map((candidate) => (
            <tr key={candidate.id}>
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
    </div>
  );
};

export default ShortlistedCandidatesTable;
