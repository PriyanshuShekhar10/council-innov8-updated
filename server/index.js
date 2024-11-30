const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config(); // Make sure to load environment variables from .env file

const app = express();
app.use(express.json());

// Enable CORS for your frontend URL
app.use(
  cors({
    origin: "*", // Ensure this matches your frontend's URL
    credentials: true,
  })
);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

// Define Mongoose Schemas and Models
const candidateSchema = new mongoose.Schema({
  objective: String,
  work_experience: Array,
  education: Array,
  skills: Array,
  id: Number,
});

const shortlistedCandidateSchema = new mongoose.Schema({
  candidateId: { type: Number, required: true },
  reason: String, // Optional: Reason for shortlisting
});

const flaggedCandidateSchema = new mongoose.Schema({
  candidateId: { type: Number, required: true },
  reason: String, // Optional: Reason for flagging
});

const Candidate = mongoose.model("Candidate", candidateSchema);
const ShortlistedCandidate = mongoose.model(
  "ShortlistedCandidate",
  shortlistedCandidateSchema
);
const FlaggedCandidate = mongoose.model(
  "FlaggedCandidate",
  flaggedCandidateSchema
);

// Define a new schema for Fraud Analysis and Influence Scores
const fraudAnalysisSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  Final_Fraud_Score: Number,
  Final_Influence_Score: Number,
  FraudAnalysis: String,
  FraudDetected: Boolean,
  FraudScore: Number,
  final_scores: Number,
});

// Create a model from the schema
const FraudAnalysis = mongoose.model("FraudAnalysis", fraudAnalysisSchema);

// Candidate CRUD Operations

// Create a Candidate
app.post("/api/candidates", async (req, res) => {
  const candidate = new Candidate(req.body);
  await candidate.save();
  res.send(candidate);
});

// Get All Candidates
app.get("/api/candidates", async (req, res) => {
  const candidates = await Candidate.find();
  res.send(candidates);
});

// Get Candidate by ID
app.get("/api/candidates/:id", async (req, res) => {
  const candidate = await Candidate.findOne({ id: req.params.id });
  if (!candidate) return res.status(404).send("Candidate not found");
  res.send(candidate);
});

// Fetch multiple candidates by IDs (batch request)
app.post("/api/candidates/batch", async (req, res) => {
  const { ids } = req.body; // Expecting an array of candidate IDs
  if (!Array.isArray(ids)) {
    return res.status(400).send("Invalid data format. 'ids' must be an array.");
  }

  try {
    const candidates = await Candidate.find({ id: { $in: ids } });
    res.send(candidates);
  } catch (err) {
    res.status(500).send("Server error: " + err.message);
  }
});

// Update Candidate by ID
app.put("/api/candidates/:id", async (req, res) => {
  const candidate = await Candidate.findOneAndUpdate(
    { id: req.params.id },
    req.body,
    { new: true }
  );
  if (!candidate) return res.status(404).send("Candidate not found");
  res.send(candidate);
});

// Delete Candidate by ID
app.delete("/api/candidates/:id", async (req, res) => {
  const candidate = await Candidate.findOneAndDelete({ id: req.params.id });
  if (!candidate) return res.status(404).send("Candidate not found");
  res.send(candidate);
});

// Shortlisted Candidates CRUD Operations

// Create a Shortlisted Candidate
app.post("/api/shortlist", async (req, res) => {
  const shortlistedCandidate = new ShortlistedCandidate(req.body);
  await shortlistedCandidate.save();
  res.send(shortlistedCandidate);
});

// Get All Shortlisted Candidates
app.get("/api/shortlist", async (req, res) => {
  const shortlistedCandidates = await ShortlistedCandidate.find();
  res.send(shortlistedCandidates);
});

// Get Shortlisted Candidate by ID
app.get("/api/shortlist/:id", async (req, res) => {
  const shortlistedCandidate = await ShortlistedCandidate.findOne({
    candidateId: req.params.id,
  });
  if (!shortlistedCandidate)
    return res.status(404).send("Shortlisted candidate not found");
  res.send(shortlistedCandidate);
});

// Update Shortlisted Candidate by ID
app.put("/api/shortlist/:id", async (req, res) => {
  const shortlistedCandidate = await ShortlistedCandidate.findOneAndUpdate(
    { candidateId: req.params.id },
    req.body,
    { new: true }
  );
  if (!shortlistedCandidate)
    return res.status(404).send("Shortlisted candidate not found");
  res.send(shortlistedCandidate);
});

// Delete Shortlisted Candidate by ID
app.delete("/api/shortlist/:id", async (req, res) => {
  const result = await ShortlistedCandidate.findOneAndDelete({
    candidateId: req.params.id,
  });
  if (!result) return res.status(404).send("Shortlisted candidate not found");
  res.send(result);
});

// Flagged Candidates CRUD Operations

// Create a Flagged Candidate
app.post("/api/flag", async (req, res) => {
  const flaggedCandidate = new FlaggedCandidate(req.body);
  await flaggedCandidate.save();
  res.send(flaggedCandidate);
});

// Get All Flagged Candidates
app.get("/api/flag", async (req, res) => {
  const flaggedCandidates = await FlaggedCandidate.find();
  res.send(flaggedCandidates);
});

// Get Flagged Candidate by ID
app.get("/api/flag/:id", async (req, res) => {
  const flaggedCandidate = await FlaggedCandidate.findOne({
    candidateId: req.params.id,
  });
  if (!flaggedCandidate)
    return res.status(404).send("Flagged candidate not found");
  res.send(flaggedCandidate);
});

// Update Flagged Candidate by ID
app.put("/api/flag/:id", async (req, res) => {
  const flaggedCandidate = await FlaggedCandidate.findOneAndUpdate(
    { candidateId: req.params.id },
    req.body,
    { new: true }
  );
  if (!flaggedCandidate)
    return res.status(404).send("Flagged candidate not found");
  res.send(flaggedCandidate);
});

// Delete Flagged Candidate by ID
app.delete("/api/flag/:id", async (req, res) => {
  const result = await FlaggedCandidate.findOneAndDelete({
    candidateId: req.params.id,
  });
  if (!result) return res.status(404).send("Flagged candidate not found");
  res.send(result);
});

// Fraud Analysis CRUD Operations

// Create a Fraud Analysis entry
app.post("/api/fraud-analysis", async (req, res) => {
  const fraudAnalysis = new FraudAnalysis(req.body);
  try {
    await fraudAnalysis.save();
    res.send(fraudAnalysis);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get Fraud Analysis by ID
app.get("/api/fraud-analysis/:id", async (req, res) => {
  const fraudAnalysis = await FraudAnalysis.findOne({ id: req.params.id });
  if (!fraudAnalysis) return res.status(404).send("Fraud analysis not found");
  res.send(fraudAnalysis);
});

// Update Fraud Analysis by ID
app.put("/api/fraud-analysis/:id", async (req, res) => {
  const fraudAnalysis = await FraudAnalysis.findOneAndUpdate(
    { id: req.params.id },
    req.body,
    { new: true }
  );
  if (!fraudAnalysis) return res.status(404).send("Fraud analysis not found");
  res.send(fraudAnalysis);
});

// Delete Fraud Analysis by ID
app.delete("/api/fraud-analysis/:id", async (req, res) => {
  const fraudAnalysis = await FraudAnalysis.findOneAndDelete({
    id: req.params.id,
  });
  if (!fraudAnalysis) return res.status(404).send("Fraud analysis not found");
  res.send(fraudAnalysis);
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
