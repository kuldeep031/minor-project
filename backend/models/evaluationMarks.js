const mongoose = require("mongoose");

const EvaluationMarksSchema = new mongoose.Schema({
  project: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Request", 
    required: true 
  },
  semester: { 
    type: Number, 
    required: true 
  },
  year: { 
    type: Number, 
    required: true 
  },
  panelNumber: { 
    type: Number, 
    required: true 
  },
  evaluations: {
    midTerm: {
      marks: [
        {
          teamMember: {
            id: { type: mongoose.Schema.Types.ObjectId, required: true },
            name: { type: String, required: true },
            roll: { type: Number, required: true },
            branch: { type: String, required: true }
          },
          evaluators: {
            chair: {
              evaluatorId: { type: mongoose.Schema.Types.ObjectId, required: true },
              name: { type: String, required: true },
              score: { type: Number, required: true }
            },
            evaluator2: {
              evaluatorId: { type: mongoose.Schema.Types.ObjectId, required: true },
              name: { type: String, required: true },
              score: { type: Number, required: true }
            },
            evaluator3: {
              evaluatorId: { type: mongoose.Schema.Types.ObjectId, required: true },
              name: { type: String, required: true },
              score: { type: Number, required: true }
            }
          },
          totalScore: { type: Number, required: true },
          averageScore: { type: Number, required: true }
        }
      ],
      evaluatedAt: { type: Date }
    },
    endTerm: {
      marks: [
        {
          teamMember: {
            id: { type: mongoose.Schema.Types.ObjectId, required: true },
            name: { type: String, required: true },
            roll: { type: Number, required: true },
            branch: { type: String, required: true }
          },
          evaluators: {
            chair: {
              evaluatorId: { type: mongoose.Schema.Types.ObjectId, required: true },
              name: { type: String, required: true },
              score: { type: Number, required: true }
            },
            evaluator2: {
              evaluatorId: { type: mongoose.Schema.Types.ObjectId, required: true },
              name: { type: String, required: true },
              score: { type: Number, required: true }
            },
            evaluator3: {
              evaluatorId: { type: mongoose.Schema.Types.ObjectId, required: true },
              name: { type: String, required: true },
              score: { type: Number, required: true }
            }
          },
          totalScore: { type: Number, required: true },
          averageScore: { type: Number, required: true }
        }
      ],
      evaluatedAt: { type: Date }
    }
  }
});

// Middleware to calculate totals and averages
EvaluationMarksSchema.pre("save", function(next) {
  const calculateScores = (term) => {
    if (this.evaluations[term]?.marks) {
      this.evaluations[term].marks.forEach(mark => {
        const scores = [
          mark.evaluators.chair.score,
          mark.evaluators.evaluator2.score,
          mark.evaluators.evaluator3.score
        ];
        mark.totalScore = scores.reduce((a, b) => a + b, 0);
        mark.averageScore = mark.totalScore / scores.length;
      });
      this.evaluations[term].evaluatedAt = this.evaluations[term].evaluatedAt || new Date();
    }
  };

  calculateScores('midTerm');
  calculateScores('endTerm');
  next();
});

module.exports = mongoose.model("EvaluationMarks", EvaluationMarksSchema);