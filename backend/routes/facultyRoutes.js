const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');

router.get('/', facultyController.getAllFaculty);
router.get('/:id', facultyController.getFacultyById);
router.post('/', facultyController.createFaculty);
router.put('/:id', facultyController.updateFaculty);
router.delete('/:email', facultyController.deleteFaculty);

// Add this to your faculty routes
router.put('/update-signature/:id', facultyController.updateSignature);
module.exports = router;
