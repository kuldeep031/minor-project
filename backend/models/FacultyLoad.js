const mongoose = require("mongoose");

const FacultyLoadSchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
  facultyName: { type: String, required: true },
  year: { type: Number, required: true },
  semester: { type: Number, required: true },
  totalGroups: { type: Number, default: 0 },
  totalStudents: { type: Number, default: 0 },
  maxGroupsAllowed: { type: Number, required: true },
  maxStudentsAllowed: { type: Number, required: true },
});

const FacultyLoad = mongoose.model("FacultyLoad", FacultyLoadSchema);
module.exports = FacultyLoad;