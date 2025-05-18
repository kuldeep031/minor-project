const express = require('express');
const router = express.Router();
const Request = require('../controllers/Request');

router.post('/createreq', Request.createrequest);
router.post('/getreq', Request.getreqbyfaculty);
router.post('/getapproved', Request.getapproved);
router.post('/getapprovedreq', Request.getapprovedreq);
router.post('/getPendingRequests', Request.getPendingRequests);
// Add this new route
router.post('/getAcceptedCount', Request.getAcceptedCount);

// Update the existing updateStatus route to handle groupNo
router.post('/updateStatus', Request.updateRequestStatus);
router.get("/requests/:id/:semester", Request.findReq);
router.post('/projects/getProjects', Request.getProjectsByEvaluators);
router.get('/activeStudents/:semester/:batch', Request.getfilteredStudents);

// Add this with your other routes
router.get('/download-report/:requestId', Request.downloadReport);
router.post('/projects-by-year-semester', Request.getProjectsByYearSemester);

module.exports = router;
