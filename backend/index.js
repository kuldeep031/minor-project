const express = require('express');
const connectDB = require('./utils/db');
const cors = require('cors');

const app = express();
connectDB();

const PORT = process.env.PORT || 5173;

// ✅ Allow requests only from your frontend URL
const allowedOrigins = [
  'http://localhost:3000', // CRA local frontend
  'https://minor-project-nwvfmaath-kuldeeps-projects-45172748.vercel.app' // Vercel frontend
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// ✅ Routes
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const authRoutes = require('./routes/authRoutes');
const requestroute = require("./routes/RequestRouter");
const uploadstudents = require("./routes/uploadSudents");
const groupRoutes = require('./routes/groupRoutes');
const FacultyLoadRoutes = require("./routes/FacultyLoadRoutes");
const evaluationRoutes = require("./routes/evaluationRoutes");

// ✅ Mount Routes
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notice', noticeRoutes);
app.use('/api/login', authRoutes);
app.use('/api/request', requestroute);
app.use('/api/uploadStudents', uploadstudents);
app.use('/api/groups', groupRoutes);
app.use('/api/facultyLoad', FacultyLoadRoutes);
app.use('/api/eveSettings', evaluationRoutes);

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// ✅ Optional: Base route
app.get("/", (req, res) => {
  res.send("Minor Project Management System API is running...");
});
