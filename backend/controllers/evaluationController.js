const Faculty = require("../models/Faculty");
const Evaluation = require("../models/evaluationSchema");
const EvaluationMarks = require("../models/evaluationMarks");
const Request = require("../models/Request");

const saveEvaluation = async (req, res) => {
  try {
    const { semester, year, panelNumber, evaluators, facultyId } = req.body;

    for (let role in evaluators) {
      if (!evaluators[role].isManual) {
        const faculty = await Faculty.findOne({ email: evaluators[role].email });

        if (!faculty) {
          return res.status(400).json({ error: `Faculty with email ${evaluators[role].email} not found` });
        }
        evaluators[role] = {
          faculty: faculty._id,  // Store reference to Faculty schema
          name: faculty.name,
          email: faculty.email
        };
      } else {
        // Keep manual entries as they are
        evaluators[role] = {
          name: evaluators[role].name,
          email: evaluators[role].email,
          isManual: true
        };
      }
    }

    const evaluation = new Evaluation({
      semester,
      year,
      panelNumber,
      evaluators,
      facultyId
    });

    await evaluation.save();
    res.status(201).json({ message: "Evaluation data saved successfully!" });
  } catch (error) {
    console.error("Error saving evaluation data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getEvaluations = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    
    const evaluations = await Evaluation.find({
      year: { $in: [currentYear, previousYear] }
    });
    
    res.status(200).json(evaluations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch evaluations" });
  }
};

const getEvaluators = async (req, res) => {
  try {
    const { semester, year, facultyId } = req.query;

    if (!semester || !year || !facultyId) {
      return res.status(400).json({ message: "All parameters are required." });
    }

    // Find evaluations where the faculty is in evaluators
    const evaluations = await Evaluation.find({
      semester: parseInt(semester),
      year: parseInt(year),
      $or: [
        { "evaluators.chair.faculty": facultyId },
        { "evaluators.evaluator2.faculty": facultyId },
        { "evaluators.evaluator3.faculty": facultyId }
      ]
    });

    if (evaluations.length === 0) {
      return res.status(404).json({ message: "No evaluators found." });
    }

    res.status(200).json(evaluations);
  } catch (error) {
    console.error("Error fetching evaluators:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



const updateEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const { semester, year, panelNumber, evaluators, facultyId } = req.body;

    // Validate if the evaluation exists
    const existingEvaluation = await Evaluation.findById(id);
    if (!existingEvaluation) {
      return res.status(404).json({ error: "Evaluation not found" });
    }

    // Update evaluators
    for (let role in evaluators) {
      if (!evaluators[role].isManual) {
        const faculty = await Faculty.findOne({ email: evaluators[role].email });

        if (!faculty) {
          return res.status(400).json({ error: `Faculty with email ${evaluators[role].email} not found` });
        }
        evaluators[role] = {
          faculty: faculty._id,
          name: faculty.name,
          email: faculty.email,
        };
      } else {
        evaluators[role] = {
          name: evaluators[role].name,
          email: evaluators[role].email,
          isManual: true,
        };
      }
    }

    // Update the evaluation
    const updatedEvaluation = await Evaluation.findByIdAndUpdate(
      id,
      { semester, year, panelNumber, evaluators, facultyId },
      { new: true }
    );

    res.status(200).json({ 
      message: "Evaluation updated successfully!", 
      updatedEvaluation 
    });
  } catch (error) {
    console.error("Error updating evaluation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// In evaluationController.js - update the saveEvaluation function
const saveEvaluationMarks = async (req, res) => {
  // Define grade calculation function inside the controller
  const calculateGrade = (totalMarks) => {
    if (totalMarks >= 90) return 'A+';
    if (totalMarks >= 80) return 'A';
    if (totalMarks >= 70) return 'B+';
    if (totalMarks >= 60) return 'B';
    if (totalMarks >= 50) return 'C';
    return 'D';
  };

  try {
    const { 
      projectId, 
      semester, 
      year, 
      panelNumber, 
      phase, 
      teamMembers, 
      evaluators 
    } = req.body;

    // Process marks with ceiling formula
    const processedMarks = teamMembers.map(member => {
      const guideScore = member.scores.chair;
      const evaluator2Score = member.scores.evaluator2;
      const evaluator3Score = member.scores.evaluator3;
      
      const otherEvaluatorsAvg = Math.ceil((evaluator2Score + evaluator3Score) / 2);
      const termScore = guideScore + otherEvaluatorsAvg;
    
      return {
        teamMember: {
          id: member.id,
          name: member.name,
          roll: member.roll,
          branch: member.branch,
          [`${phase === 'Mid-Term' ? 'midTermMarks' : 'endTermMarks'}`]: termScore
        },
        evaluators: {
          chair: {
            evaluatorId: evaluators.chair.faculty,
            name: evaluators.chair.name,
            score: guideScore
          },
          evaluator2: {
            evaluatorId: evaluators.evaluator2.faculty,
            name: evaluators.evaluator2.name,
            score: evaluator2Score
          },
          evaluator3: {
            evaluatorId: evaluators.evaluator3.faculty,
            name: evaluators.evaluator3.name,
            score: evaluator3Score
          }
        },
        totalScore: termScore,
        averageScore: termScore
      };
    });

    // Get current project
    const project = await Request.findById(projectId);
    if (!project) throw new Error("Project not found");

    // Prepare team member updates
    const updatedTeamMembers = project.teamMembers.map(existingMember => {
      const newData = processedMarks.find(m => 
        String(m.teamMember.id) === String(existingMember.id)
      );
      
      if (!newData) return existingMember;

      const updatedMember = {
        ...existingMember.toObject(),
        ...newData.teamMember
      };

      // Calculate total and grade when both terms exist
      if (updatedMember.midTermMarks !== undefined && 
          updatedMember.endTermMarks !== undefined) {
        updatedMember.totalMarks = updatedMember.midTermMarks + updatedMember.endTermMarks;
        updatedMember.grade = calculateGrade(updatedMember.totalMarks);
      }

      return updatedMember;
    });

    // Update EvaluationMarks
    const evaluationDoc = await EvaluationMarks.findOneAndUpdate(
      { project: projectId, semester, year },
      {
        $set: {
          project: projectId,
          semester,
          year,
          panelNumber,
          [`evaluations.${phase === 'Mid-Term' ? 'midTerm' : 'endTerm'}`]: {
            marks: processedMarks,
            evaluatedAt: new Date()
          }
        }
      },
      { upsert: true, new: true }
    );

    // Update Request document
    await Request.findByIdAndUpdate(
      projectId,
      {
        $set: {
          chairId : evaluators.chair.faculty,
          teamMembers: updatedTeamMembers,
          evaluationRecord: evaluationDoc._id,
          [`${phase === 'Mid-Term' ? 'midTermEvaluated' : 'endTermEvaluated'}`]: true
        }
      }
    );

    res.status(200).json({
      success: true,
      message: `${phase} evaluation saved successfully`,
      data: {
        termScores: processedMarks.map(m => ({
          member: m.teamMember.name,
          score: m.totalScore
        })),
        calculatedTotals: updatedTeamMembers
          .filter(m => m.totalMarks !== undefined)
          .map(m => ({ name: m.name, total: m.totalMarks, grade: m.grade }))
      }
    });

  } catch (error) {
    console.error("Error saving evaluation:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};



module.exports = { 
  saveEvaluationMarks,
  saveEvaluation, 
  getEvaluations, 
  getEvaluators, 
  updateEvaluation 
};