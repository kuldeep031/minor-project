
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const fs = require("fs");
const Papa = require("papaparse");

function getAcademicYear(semester) {
  const currentYear = new Date().getFullYear();
  if (semester % 2 !== 0) {
    return `${currentYear}-${currentYear + 1}`; // Odd semester (1, 3, 5, 7)
  } else {
    return `${currentYear - 1}-${currentYear}`; // Even semester (2, 4, 6, 8)
  }
}

// Helper function to calculate batch (admission year) based on semester
function getBatch(semester) {
  const currentYear = new Date().getFullYear();
  return currentYear - Math.floor(semester / 2); // Admission year based on semester
}

// Upload students function
exports.uploadStudents = async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  try {
    // Read the CSV file
    const csvFile = fs.readFileSync(file.path, "utf8");

    // Parse the CSV file
    const parsedData = Papa.parse(csvFile, {
      header: true, // Treat the first row as headers
      skipEmptyLines: true,
    });

    // Remove the file after parsing
    fs.unlinkSync(file.path);

    const students = parsedData.data;

    // Map the parsed data to match the Student schema
    const formattedStudents = students.map((student) => {
      const semester = student.semester ? parseInt(student.semester) : null;
      const RollNumber = student.rollNo ? parseInt(student.rollNo) : null;
      return {
        name: student.name || null,
        email: student.email || null,
        RollNumber: RollNumber,
        branch: student.branch || null,
        semester: semester,
        attendance: student.attendance ? parseInt(student.attendance) : 0,
        password: student.password || "defaultPassword123", // Default password (hashed later)
        batch: getBatch(semester), // Calculating batch based on semester
        academicYear: getAcademicYear(semester), // Calculating academic year based on semester
      };
    });

    // Insert students into the database
    const insertedStudents = await Student.insertMany(formattedStudents);
    res.status(200).json({ message: "Students uploaded successfully.", data: insertedStudents });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error processing the CSV file.", error });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find(); // Removed `populate('course')`
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id); // Removed `populate('course')`
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.createStudent = async (req, res) => {
  try {
    const { name, email, password, semester, branch, RollNumber } = req.body;

    // Check if student already exists by email
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: "Student with this email already exists" });
    }

    const newStudent = new Student({
      name,
      email,
      password,
      semester,
      branch,
      RollNumber,
      batch: getBatch(semester), // Calculate batch
      academicYear: getAcademicYear(semester), // Calculate academic year
    });

    await newStudent.save();
    res.status(201).json({ message: "Student created successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.updateStudent = async (req, res) => {
  try {
      const { name, email, password, RollNumber, course, batch, academicYear, branch, semester } = req.body;

      // Validate required fields
      if (!name || !email || !RollNumber || !branch || !semester) {
          return res.status(400).json({ message: 'Name, email, rollNo, branch, and semester are required.' });
      }

      // Find and update student
      const updatedStudent = await Student.findByIdAndUpdate(
          req.params.id,
          { name, email, password, RollNumber, course, batch, academicYear, branch, semester },
          { new: true, runValidators: true }
      );

      if (!updatedStudent) {
          return res.status(404).json({ message: 'Student not found.' });
      }

      res.status(200).json(updatedStudent);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to update student.', error: error.message });
  }
};


exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.params.email });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const deletedStudent = await Student.findByIdAndDelete(student._id);
    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const updates = req.body;
    if (!Array.isArray(updates)) {
      throw new Error("Updates must be an array");
    }

    const bulkOperations = updates.map((update) => ({
      updateOne: {
        filter: { _id: update.studentId },
        update: { $inc: { attendance: update.attendanceCount } },
      },
    }));

    await Student.bulkWrite(bulkOperations);
    res.json({ message: "Attendance updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.totalAttendance = async (req, res) => {
  try {
    const updatedAttendance = await Attendance.findByIdAndUpdate(
      "662b3c2219a7f45154c025bb",
      req.body,
      { new: true }
    );
    if (!updatedAttendance) {
      return res.status(404).json({ message: "Attendance not found" });
    }
    res.json({
      updatedAttendance: updatedAttendance,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStudentsBySemesterAndBatch = async (req, res) => {
  try {
    const { semester, batch } = req.query;

    // Validate input
    if (!semester || !batch) {
      return res.status(400).json({ message: "Semester and batch are required." });
    }

    // Find students matching the semester and batch
    const students = await Student.find({ semester: parseInt(semester), batch: parseInt(batch) });

    if (students.length === 0) {
      return res.status(404).json({ message: "No students found for the given semester and batch." });
    }

    res.status(200).json({ data: students });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
