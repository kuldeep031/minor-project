const express = require("express");
const {saveEvaluationMarks, saveEvaluation,getEvaluations, getEvaluators,updateEvaluation  } = require("../controllers/evaluationController");

const router = express.Router();

// Route to save evaluation
router.post("/evaluation", saveEvaluation);

// Route to get all evaluations
router.get("/", getEvaluations);

router.get("/evaluators",getEvaluators);
// Route to update evaluation
router.put("/evaluation/:id", updateEvaluation);
router.post("/saveEvaluationMarks", saveEvaluationMarks);

module.exports = router;
