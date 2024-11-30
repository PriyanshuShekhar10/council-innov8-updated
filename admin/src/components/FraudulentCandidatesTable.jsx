import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TableStyles.css"; // Assuming you have a CSS file for table styles

const FraudulentCandidatesTable = () => {
  const [fraudulentCandidates, setFraudulentCandidates] = useState([]);

  useEffect(() => {
    const fetchFraudulentCandidates = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/flag");
        const uniqueIds = [...new Set(response.data.map(item => item.candidateId))];

        const candidatesPromises = uniqueIds.map(id =>
          axios.get(`http://localhost:3000/api/candidates/${id}`)
        );
        const candidatesResponses = await Promise.all(candidatesPromises);

        const candidates = candidatesResponses
          .map(res => res.data)
          .filter(candidate => 
            candidate.work_experience[0]?.job_title &&
            candidate.work_experience[0]?.job_title.toLowerCase() !== "n/a"
          );

        setFraudulentCandidates(candidates);
      } catch (error) {
        console.error("Error fetching fraudulent candidates:", error);
      }
    };

    fetchFraudulentCandidates();
  }, []);

  const handleMoveBack = async (candidateId) => {
    try {
      await axios.delete(`http://localhost:3000/api/flag/${candidateId}`);
      setFraudulentCandidates(prev => prev.filter(candidate => candidate.id !== candidateId));
    } catch (error) {
      console.error("Error moving candidate back:", error);
    }
  };

  const handleRemoveFromProcess = async (candidateId) => {
    try {
      await axios.delete(`http://localhost:3000/api/candidates/${candidateId}`);
      setFraudulentCandidates(prev => prev.filter(candidate => candidate.id !== candidateId));
    } catch (error) {
      console.error("Error removing candidate from process:", error);
    }
  };

  return (
    <div className="table-container">
      <h2>Fraudulent Candidates</h2>
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
          {fraudulentCandidates.map((candidate) => (
            <tr key={candidate.id}>
              <td>{candidate.id}</td>
              <td>Dummy Name</td> {/* Placeholder name */}
              <td>{candidate.work_experience?.[0]?.job_title || "N/A"}</td>
              <td>
                <button className="action-button move-back" onClick={() => handleMoveBack(candidate.id)}>Move Back</button>
                <button className="action-button remove" onClick={() => handleRemoveFromProcess(candidate.id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FraudulentCandidatesTable;
