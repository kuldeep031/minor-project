const mongoose = require("mongoose");

const EvaluationSchema = new mongoose.Schema({
  semester: Number,
  year: Number,
  panelNumber: { type: Number, required: true },
  evaluators: {
    chair: {
      faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", default: null },
      name: String,
      email: String,
      isManual: Boolean
    },
    evaluator2: {
      faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", default: null },
      name: String,
      email: String,
      isManual: Boolean
    },
    evaluator3: {
      faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", default: null },
      name: String,
      email: String,
      isManual: Boolean
    }
  }
});

module.exports = mongoose.model("Evaluation", EvaluationSchema);