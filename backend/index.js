const express = require('express');
const connectDB = require('./utils/db');
const cors = require('cors')

const app = express();
connectDB();
const PORT = 5173

app.use(express.json());
app.use(cors({}));

// Routes
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const authRoutes = require('./routes/authRoutes');
const requestroute = require("./routes/RequestRouter");
const uploadstudents = require("./routes/uploadSudents");
const groupRoutes = require('./routes/groupRoutes'); // Import the group routes
const FacultyLoadRoutes = require("./routes/FacultyLoadRoutes");
const evaluationRoutes = require("./routes/evaluationRoutes");

// Mounting routes
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notice', noticeRoutes);
app.use('/api/login', authRoutes);
app.use('/api/request', requestroute);
app.use('/api/uploadStudents', uploadstudents);
app.use('/api/groups', groupRoutes); // Mount groupRoutes here
app.use('/api/facultyLoad', FacultyLoadRoutes);
app.use('/api/eveSettings', evaluationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})
