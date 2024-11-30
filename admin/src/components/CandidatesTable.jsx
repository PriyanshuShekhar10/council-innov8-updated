import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import fraudData from "../Data/Resume.fraudanalyses.json";

const CandidatesTable = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [candidatesPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedSkill, setSelectedSkill] = useState(""); // New state for skill filter

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const candidatesResponse = await axios.get(
          "http://localhost:3000/api/candidates"
        );
        const shortlistedResponse = await axios.get(
          "http://localhost:3000/api/shortlist"
        );
        const fraudulentResponse = await axios.get(
          "http://localhost:3000/api/flag"
        );

        const shortlistedIds = new Set(
          shortlistedResponse.data.map((item) => item.candidateId)
        );
        const fraudulentIds = new Set(
          fraudulentResponse.data.map((item) => item.candidateId)
        );

        const filteredCandidates = candidatesResponse.data
          .filter(
            (candidate) =>
              !shortlistedIds.has(candidate.id) &&
              !fraudulentIds.has(candidate.id) &&
              candidate.work_experience[0]?.job_title &&
              candidate.work_experience[0]?.job_title.toLowerCase() !== "n/a"
          )
          .map((candidate) => {
            const fraudRecord = fraudData.find(
              (item) => item.id === candidate.id
            );
            return {
              ...candidate,
              fraudIndex: fraudRecord ? fraudRecord.final_scores : "N/A",
            };
          });

        setCandidates(filteredCandidates);
      } catch (error) {
        console.error("Error fetching candidates:", error);
      }
    };

    fetchCandidates();
  }, []);

  // Filter candidates by selected skill
  const filterCandidatesBySkill = (candidates) => {
    if (!selectedSkill) return candidates; // If no skill is selected, return all candidates
    return candidates.filter((candidate) =>
      candidate.skills?.some((skill) =>
        skill.toLowerCase().includes(selectedSkill.toLowerCase())
      )
    );
  };

  // Sort candidates by fraud index
  const sortCandidatesByFraudIndex = () => {
    const sortedCandidates = [...candidates].sort((a, b) => {
      if (a.fraudIndex === "N/A") return 1;
      if (b.fraudIndex === "N/A") return -1;
      return sortOrder === "asc"
        ? a.fraudIndex - b.fraudIndex
        : b.fraudIndex - a.fraudIndex;
    });
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    setCandidates(sortedCandidates);
  };

  const handleCheckboxChange = (event, candidateId) => {
    if (event.target.checked) {
      setSelectedCandidates((prev) => [...prev, candidateId]);
    } else {
      setSelectedCandidates((prev) => prev.filter((id) => id !== candidateId));
    }
  };

  const indexOfLastCandidate = currentPage * candidatesPerPage;
  const indexOfFirstCandidate = indexOfLastCandidate - candidatesPerPage;
  const currentCandidates = filterCandidatesBySkill(candidates).slice(
    indexOfFirstCandidate,
    indexOfLastCandidate
  );

  const totalPages = Math.ceil(candidates.length / candidatesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleShortlistCandidates = async () => {
    try {
      for (const candidateId of selectedCandidates) {
        await axios.post("http://localhost:3000/api/shortlist", {
          candidateId,
        });
      }
      alert("Selected candidates shortlisted successfully.");
      setSelectedCandidates([]); // Clear selected candidates
    } catch (error) {
      console.error("Error shortlisting candidates:", error);
    }
  };

  const handleFlagCandidates = async () => {
    try {
      for (const candidateId of selectedCandidates) {
        await axios.post("http://localhost:3000/api/flag", { candidateId });
      }
      alert("Selected candidates flagged successfully.");
      setSelectedCandidates([]); // Clear selected candidates
    } catch (error) {
      console.error("Error flagging candidates:", error);
    }
  };

  const getPaginationButtons = () => {
    const buttons = [];
    buttons.push(
      <button
        key="first"
        onClick={() => paginate(1)}
        disabled={currentPage === 1}
      >
        First
      </button>
    );
    if (currentPage > 1) {
      buttons.push(
        <button key="prev-page" onClick={() => paginate(currentPage - 1)}>
          {currentPage - 1}
        </button>
      );
    }
    buttons.push(
      <button key="current" className="active">
        {currentPage}
      </button>
    );
    if (currentPage < totalPages) {
      buttons.push(
        <button key="next-page" onClick={() => paginate(currentPage + 1)}>
          {currentPage + 1}
        </button>
      );
    }
    buttons.push(
      <button
        key="last"
        onClick={() => paginate(totalPages)}
        disabled={currentPage === totalPages}
      >
        Last
      </button>
    );
    return buttons;
  };

  const handleRowClick = (candidateId) => {
    navigate(`/candidates/${candidateId}`);
  };

  // Skills dropdown (for simplicity, using a hardcoded list of skills)
  const availableSkills = [
    "JavaScript",
    "Python",
    "React",
    "Node.js",
    "SQL",
    "Java",
    "PHP",
    "Ruby",
    "CSS",
    "HTML",
  ];

  return (
    <div className="table-container">
      <div className="bulk-action">
        <button onClick={handleShortlistCandidates}>Shortlist Selected</button>
        <button onClick={handleFlagCandidates}>Flag Selected</button>
      </div>

      {/* Skill filter dropdown */}
      <div className="skill-filter">
        <select
          value={selectedSkill}
          onChange={(e) => setSelectedSkill(e.target.value)}
        >
          <option value="">Filter by Skill</option>
          {availableSkills.map((skill) => (
            <option key={skill} value={skill}>
              {skill}
            </option>
          ))}
        </select>
      </div>

      <table className="candidates-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={(e) =>
                  setSelectedCandidates(
                    e.target.checked ? currentCandidates.map((c) => c.id) : []
                  )
                }
                checked={
                  selectedCandidates.length === currentCandidates.length &&
                  currentCandidates.length > 0
                }
              />
            </th>
            <th>Id No</th>
            <th>Name</th>
            <th>Latest Job Title</th>
            <th
              onClick={sortCandidatesByFraudIndex}
              style={{ cursor: "pointer" }}
            >
              Fraud Index {sortOrder === "asc" ? "▲" : "▼"}
            </th>
          </tr>
        </thead>
        <tbody>
          {currentCandidates.map((candidate) => {
            const isHighFraud = candidate.fraudIndex > 0.6;
            return (
              <tr
                key={candidate.id}
                className={isHighFraud ? "high-fraud" : ""}
                onClick={() => handleRowClick(candidate.id)}
                style={{ cursor: "pointer" }}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedCandidates.includes(candidate.id)}
                    onChange={(e) => handleCheckboxChange(e, candidate.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td>{candidate.id}</td>
                <td>Dummy Name</td>
                <td>{candidate.work_experience[0]?.job_title || "N/A"}</td>
                <td>{candidate.fraudIndex}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="pagination">{getPaginationButtons()}</div>
    </div>
  );
};

export default CandidatesTable;
