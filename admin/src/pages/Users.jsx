import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import StarIcon from "@mui/icons-material/Star";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import styles from "./CandidateDetails.module.css";

const CandidateDetails = () => {
  const { id } = useParams(); // Extract the id from the URL
  const [candidate, setCandidate] = useState(null);
  const [fraudAnalysis, setFraudAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false); // State to handle hover effect
  const analysisRef = useRef(null); // Reference to the analysis container

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/candidates/${id}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setCandidate(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchFraudAnalysis = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/fraud-analysis/${id}`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        setFraudAnalysis(data);
        console.log("Fraud Analysis Data:", data); // Print to console
      } catch (error) {
        console.error("Failed to fetch fraud analysis data:", error.message);
      }
    };

    fetchFraudAnalysis();
    fetchCandidate();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const fraudScore = fraudAnalysis?.Final_Fraud_Score || 0;
  const influenceScore = fraudAnalysis?.Final_Influence_Score || 0;
  const overallScore = fraudAnalysis?.final_scores || 0;

  // Determine color based on score
  const getColor = (score) => {
    if (score > 75) return "#FF4C4C"; // Red for high risk
    if (score > 50) return "#FFA500"; // Orange for medium risk
    return "#4CAF50"; // Green for low risk
  };

  return (
    <div className={styles.container}>
      {/* Left side - 25% */}
      <div className={styles.leftPanel}>
        <div>
          <img
            src="https://t4.ftcdn.net/jpg/01/24/65/69/360_F_124656969_x3y8YVzvrqFZyv3YLWNo6PJaC88SYxqM.jpg"
            alt="Avatar"
            className={styles.avatar}
          />
        </div>
        <div className={styles.details}>
          <h2>Candidate Details</h2>
          <p>
            <strong>ID:</strong> {id}
          </p>
          <p>
            <strong>Name:</strong> {candidate?.name || "Unknown"}
          </p>
          <p>
            <strong>Job Title:</strong> {candidate?.job_title || "Unknown"}
          </p>
        </div>
        <div className={styles.skills}>
          <h3>Skills</h3>
          {candidate?.skills && candidate.skills.length > 0 ? (
            <ul>
              {candidate.skills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          ) : (
            <p>No skills listed.</p>
          )}
        </div>
      </div>

      {/* Right side - 75% */}
      <div className={styles.rightPanel}>
        {/* Fraud Analysis Section at the top */}
        <h2 className={styles.sectionTitle}>Analysis Overview</h2>
        <div className={styles.graphContainer}>
          <div
            className={styles.graph}
            onMouseEnter={() => setShowAnalysis(true)}
            onMouseLeave={() => setShowAnalysis(false)}
          >
            <CircularProgressbar
              value={fraudScore * 100} // Assuming the score is in decimal format
              maxValue={100}
              text={`${(fraudScore * 100).toFixed(1)}%`}
              styles={buildStyles({
                textColor: getColor(fraudScore * 100),
                pathColor: getColor(fraudScore * 100),
                trailColor: "#f0f0f0",
                textSize: "16px",
                pathTransitionDuration: 0.5,
                trailColor: "#d6d6d6",
                backgroundColor: "#f8f9fa",
              })}
            />
            <p className={styles.graphLabel}>Fraud Score</p>{" "}
            {/* Title for Fraud Score */}
            {showAnalysis && (
              <div ref={analysisRef} className={styles.analysisTooltip}>
                <p>
                  <strong>Final Fraud Score:</strong>{" "}
                  {fraudAnalysis.Final_Fraud_Score}
                </p>
                <p>
                  <strong>Fraud Analysis:</strong> {fraudAnalysis.FraudAnalysis}
                </p>
              </div>
            )}
          </div>

          <div className={styles.graph}>
            <CircularProgressbar
              value={influenceScore * 100}
              maxValue={100}
              text={`${(influenceScore * 100).toFixed(1)}%`}
              styles={buildStyles({
                textColor: getColor(influenceScore * 100),
                pathColor: getColor(influenceScore * 100),
                trailColor: "#f0f0f0",
                textSize: "16px",
                pathTransitionDuration: 0.5,
                trailColor: "#d6d6d6",
                backgroundColor: "#f8f9fa",
              })}
            />
            <p className={styles.graphLabel}>Influence Score</p>
          </div>

          <div className={styles.graph}>
            <CircularProgressbar
              value={overallScore * 100}
              maxValue={100}
              text={`${(overallScore * 100).toFixed(1)}%`}
              styles={buildStyles({
                textColor: getColor(overallScore * 100),
                pathColor: getColor(overallScore * 100),
                trailColor: "#f0f0f0",
                textSize: "16px",
                pathTransitionDuration: 0.5,
                trailColor: "#d6d6d6",
                backgroundColor: "#f8f9fa",
              })}
            />
            <p className={styles.graphLabel}>Overall Score</p>
          </div>
        </div>

        <h2 className={styles.sectionTitle}>Work Experience</h2>
        {candidate?.work_experience && candidate.work_experience.length > 0 ? (
          <VerticalTimeline>
            {candidate.work_experience.map((experience, index) => (
              <VerticalTimelineElement
                key={index}
                className="vertical-timeline-element--work"
                contentStyle={{
                  background: "white",
                  color: "#fff",
                }}
                contentArrowStyle={{
                  borderRight: "7px solid black",
                }}
                date={
                  <span
                    style={{
                      color: "#FA4B00",
                      fontSize: "150%",
                      fontWeight: "bold",
                    }}
                  >
                    {experience.duration}
                  </span>
                }
                iconStyle={{ background: "rgb(33, 150, 243)", color: "#fff" }}
                icon={<WorkIcon />}
              >
                <h3 className="vertical-timeline-element-title">
                  <span style={{ color: "#FA4B00", fontSize: "150%" }}>
                    {experience.job_title}
                  </span>
                </h3>
                <h4 className="vertical-timeline-element-subtitle">
                  {experience.location}
                </h4>
                <p>
                  <span style={{ color: "black" }}>
                    {experience.responsibilities}
                  </span>
                </p>
              </VerticalTimelineElement>
            ))}
            <VerticalTimelineElement
              iconStyle={{ background: "rgb(16, 204, 82)", color: "#fff" }}
              icon={<StarIcon />}
            />
          </VerticalTimeline>
        ) : (
          <p>No work experience available.</p>
        )}

        <h2 className={styles.sectionTitle}>Education</h2>
        {candidate?.education && candidate.education.length > 0 ? (
          <VerticalTimeline>
            {candidate.education.map((education, index) => (
              <VerticalTimelineElement
                key={index}
                className="vertical-timeline-element--education"
                contentStyle={{
                  background: "rgb(233, 30, 99)",
                  color: "#fff",
                }}
                contentArrowStyle={{
                  borderRight: "7px solid rgb(233, 30, 99)",
                }}
                date={education.graduation_year}
                iconStyle={{ background: "rgb(233, 30, 99)", color: "#fff" }}
                icon={<SchoolIcon />}
              >
                <h3 className="vertical-timeline-element-title">
                  {education.degree}
                </h3>
                <h4 className="vertical-timeline-element-subtitle">
                  {education.institution}
                </h4>
                <p>{/* Add additional education details if available */}</p>
              </VerticalTimelineElement>
            ))}
          </VerticalTimeline>
        ) : (
          <p>No education details available.</p>
        )}
      </div>
    </div>
  );
};

export default CandidateDetails;
