const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
    GroupNo: {type: Number, default: 0},
    batch: { type: Number, required: true },
    teamMembers: [
        {
            id: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
            name: { type: String, required: true },
            roll: { type: Number, required: true },
            branch: { type: String, required: true },
            midTermMarks: { type: Number, default: null },  // New field
            endTermMarks: { type: Number, default: null },   // New field
            totalMarks: { type: Number, default: null },     // New field
            grade: { type: String, default: null } 
        }
    ],
    year: { type: Number, required: true }, 
    semester: { type: Number, required: true },  
    Title: { type: String, required: true },
    Content: { type: String, required: true },
    Faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
    facultyName: { type: String, required: true },
    Approved: { type: Boolean, default: false },
    Status: { type: String, default: "pending" },
    Evaluated: { type: Boolean, default: false },
    midTermEvaluated: { type: Boolean, default: false },  // New field
    endTermEvaluated: { type: Boolean, default: false },  // New field
    chairId: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", default: null },
    evaluationRecord: {  // New reference to EvaluationMarks
        type: mongoose.Schema.Types.ObjectId,
        ref: "EvaluationMarks",
        default: null
    }
});

const Request = mongoose.model('Request', RequestSchema);

module.exports = Request;