const FacultyLoad = require("../models/FacultyLoad");

// Fetch FacultyLoad data based on facultyId, semester, and year
exports.getFacultyLoad = async (req, res) => {
  try {
    const { facultyId, semester, year } = req.query;

    if (!facultyId || !semester || !year) {
      return res.status(400).json({ message: "Missing required query parameters: facultyId, semester, or year" });
    }

    // Find FacultyLoad documents matching the query
    const facultyLoadData = await FacultyLoad.find({
      facultyId,
      semester: parseInt(semester),
      year: parseInt(year),
    });

    if (facultyLoadData.length === 0) {
      return res.status(404).json({ message: "Faculty load data not found" });
    }

    res.status(200).json(facultyLoadData);
  } catch (error) {
    console.error("Error fetching faculty load data:", error);
    res.status(500).json({ message: "Error fetching faculty load data", error });
  }
};


// exports.updateFacultyLoad = async (req, res) => {
//   const { facultyId, semm, year, teamSize } = req.body;

//   try {
//     // Find the existing FacultyLoad record
//     const facultyLoad = await FacultyLoad.findOne({
//       facultyId,
//       semester: semm,
//       year,
//     });

//     if (!facultyLoad) {
//       return res.status(404).json({ message: "Faculty load not found." });
//     }

//     // Update totalGroups and totalStudents
//     facultyLoad.totalGroups += 1; // Increment totalGroups by 1
//     facultyLoad.totalStudents += teamSize; // Add teamSize to totalStudents

//     // Save the updated document
//     await facultyLoad.save();

//     res.status(200).json({ message: "Faculty load updated successfully.", data: facultyLoad });
//   } catch (error) {
//     console.error("Error updating faculty load:", error);
//     res.status(500).json({ message: "Error updating faculty load.", error });
//   }
// };
exports.updateFacultyLoad = async (req, res) => {
  const { facultyId, year, semester, value } = req.body;

  if (!facultyId || !year || !semester || value === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Find the document by facultyId, year, and semester
    const faculty = await FacultyLoad.findOne({ facultyId, year, semester });

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty record not found' });
    }

    // Update totalGroups and totalStudents
    faculty.totalGroups += 1;
    faculty.totalStudents += value;

    // Save the updated document
    await faculty.save();

    res.status(200).json({ message: 'Faculty stats updated successfully', faculty });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};