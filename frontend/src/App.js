import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import LandingPage from './components/LandingPage';
import AdminFacultyLogin from './components/AdminFacultyLogin';
import StudentLogin from './components/StudentLogin';

import AdminDashboard from './components/Admin/AdminDashboard';
import ManageStudents from './components/Admin/ManageStudents';
import ManageFaculty from './components/Admin/ManageFaculty';
import AdminHelpAndSupport from './components/AdminHelpAndSupport';
import ManageGroups from './components/Admin/ManageGroups';
import AdminManageProfile from './components/Admin/ManageAdProfile';///
import ProjView from './components/Admin/ProjView';

import FacultyDashboard from './components/Faculty/FacultyDashboard';
import ManageAttendance from './components/Faculty/ManageAttendance';
import ViewStudent from './components/Faculty/ViewStudent';
import FacultyManageProfile from './components/Faculty/ManageProfile';
import FacultyHelpAndSupport from './components/FacultyHelpAndSupport';
import ProjectReq from "./components/Faculty/Projectreq";
import Projectinfo from "./components/Faculty/Projectinfo";
import Evaluation from "./components/Admin/Evaluation";
import ProjEval from "./components/Faculty/ProjEval";

import StudentDashboard from './components/Student/StudentDashboard';
import StudentManageProfile from './components/Student/ManageProfile';
import ViewAttendance from './components/Student/ViewAttendance';
import StudentHelpAndSupport from './components/StudentHelpAndSupport';
import Projectappr from './components/Student/Projectappr';

import Unauthorised from './components/Unauthorised';

function App() {
  const LoggedIn = ({ element }) => {
    const isAuthenticated = localStorage.getItem('jwt');
    if (isAuthenticated) {
      const isAdmin = JSON.parse(localStorage.getItem('isAdmin'));
      const isStudent = JSON.parse(localStorage.getItem('isStudent'));
      if (isAdmin) {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (isStudent) {
        return <Navigate to="/student/dashboard" replace />;
      } else {
        return <Navigate to="/faculty/dashboard" replace />;
      }
    } else {
      return element;
    }
  };

  const PrivateRoute = ({ element }) => {
    const isAuthenticated = localStorage.getItem('jwt');
    const isAdmin = JSON.parse(localStorage.getItem('isAdmin'));
    const isStudent = JSON.parse(localStorage.getItem('isStudent'));

    if (!isAuthenticated) {
      return <Unauthorised />;
    }

    if (isAdmin && window.location.pathname.startsWith('/admin')) {
      return element;
    } else if (!isAdmin && !isStudent && window.location.pathname.startsWith('/faculty')) {
      return element;
    } else if (!isAdmin && isStudent && window.location.pathname.startsWith('/student')) {
      return element;
    } else {
      return <Unauthorised />;
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<LoggedIn element={<LandingPage />} />}
        />
        <Route
          path="/admin-faculty/login"
          element={<LoggedIn element={<AdminFacultyLogin />} />}
        />
        <Route
          path="/student/login"
          element={<LoggedIn element={<StudentLogin />} />}
        />

        <Route
          path="/admin/dashboard"
          element={<PrivateRoute element={<AdminDashboard />} />}
        />
        <Route
          path='/admin/dashboard/manage-students'
          element={<PrivateRoute element={<ManageStudents />} />}
        />
        <Route
          path='/admin/dashboard/manage-groups'
          element={<PrivateRoute element={<ManageGroups />} />}
        />
        <Route
          path='/admin/dashboard/manage-profile'
          element={<PrivateRoute element={<AdminManageProfile />} />}
        />
        <Route
          path='/admin/dashboard/manage-faculty'
          element={<PrivateRoute element={<ManageFaculty />} />}
        />
        <Route
          path='/admin/dashboard/Projview'
          element={<PrivateRoute element={<ProjView />} />}
        />
        <Route
          path='/admin/help-support'
          element={<PrivateRoute element={<AdminHelpAndSupport />} />}
        />

        <Route
          path="/faculty/dashboard"
          element={<PrivateRoute element={<FacultyDashboard />} />}
        />
        <Route
          path='/faculty/dashboard/manage-attendance'
          element={<PrivateRoute element={<ManageAttendance />} />}
        />
        <Route
          path='/faculty/dashboard/view-students'
          element={<PrivateRoute element={<ViewStudent />} />}
        />
        <Route
          path='/faculty/dashboard/manage-profile'
          element={<PrivateRoute element={<FacultyManageProfile />} />}
        />
        <Route
          path='/faculty/help-support'
          element={<PrivateRoute element={<FacultyHelpAndSupport />} />}
        />
        <Route
          path='/faculty/projectinfo'
          element={<PrivateRoute element={<Projectinfo />} />}
        />
        <Route
          path='/faculty/project-req'
          element={<PrivateRoute element={<ProjectReq />} />}
        />
        <Route
          path='/admin/evaluationSettings'
          element={<PrivateRoute element={<Evaluation />} />}
        />

        <Route
          path='/faculty/ProjectEvaluation'
          element={<PrivateRoute element={<ProjEval />} />}
        />

        <Route
          path="/student/dashboard"
          element={<PrivateRoute element={<StudentDashboard />} />}
        />
        <Route
          path="/student/dashboard/manage-profile"
          element={<PrivateRoute element={<StudentManageProfile />} />}
        />
        <Route
          path="/student/dashboard/view-attendance"
          element={<PrivateRoute element={<ViewAttendance />} />}
        />
        <Route
          path="/student/project"
          element={<PrivateRoute element={<Projectappr />} />}
        />
        <Route
          path="/student/help-support"
          element={<PrivateRoute element={<StudentHelpAndSupport />} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
