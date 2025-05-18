const express = require("express");
const router = express.Router();
const FacultyLoadController = require("../controllers/FacultyLoadController");

// Route to fetch FacultyLoad data
router.get("/", FacultyLoadController.getFacultyLoad);
router.put('/update-faculty-stats', FacultyLoadController.updateFacultyLoad);

module.exports = router;