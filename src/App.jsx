import React, { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from './components/PrivateRoute';
// Course routes
import AllCourses from './pages/courses/AllCourses';
import AddCourses from './pages/courses/AddCourses';
import CourseRequest from './pages/courses/CourseRequest';
import CourseDetails from './pages/courses/CourseDetails';
import Createquiz from './pages/courses/Createquiz';

// Enrollment routes
import ProgressReports from "./pages/enrollments/ProgressReports";
import EnList from "./pages/enrollments/EnList";

// Discussion routes
import QApage from "./pages/discussions/QApage";

// Analytics routes
import CourseAnalytics from "./pages/analytics/CourseAnalytics";

// Announcements routes
import SendAnnouncements from "./pages/announcements/SendAnnouncements";

// Content library routes
import ContentLibrary from "./pages/contentlibrary/ContentLibrary";

// Settings routes
import Platformsetngs from "./pages/settings/Platformsetngs";

// Admin management routes
import SubadminsPage from "./pages/admin_management/subadminspage";
// Main App Component
import { AuthProvider } from './contexts/AuthContext';
import AppLayout from "./components/AppLayout";

function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<AppLayout />}>
              {/* Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Courses */}
              <Route path="/courses" element={<AllCourses />} />
              <Route path="/courses/add" element={<AddCourses />} />
              <Route path="/courses/requests" element={<CourseRequest />} />
              
              {/* Enrollments */}
              <Route path="/enrollments/list" element={<EnList />} />
              <Route path="/enrollments/reports" element={<ProgressReports />} />
              
              {/* Discussions */}
              <Route path="/discussions/monitor" element={<QApage />} />
              
              {/* Analytics */}
              <Route path="/analytics/courses" element={<CourseAnalytics />} />
              
              {/* Announcements */}
              <Route path="/announcements/send" element={<SendAnnouncements />} />
              
              {/* Content Library */}
              <Route path="/content/organize" element={<ContentLibrary />} />
              
              {/* Feedback & Reviews - Using placeholders until components are created */}
              <Route path="/feedback/user" element={<div>User Feedback</div>} />
              <Route path="/feedback/flag" element={<div>Flagged Feedback</div>} />
              
              {/* Settings */}
              <Route path="/settings/platform" element={<Platformsetngs />} />
              
              {/* Admin Management */}
              <Route path="/admin/roles" element={<SubadminsPage />} />
              
              {/* Course Details */}
              <Route path="/courses/:courseId" element={<CourseDetails />} />
              <Route path="/courses/:courseId/create-quiz" element={<Createquiz />} />
              <Route path="/courses/:courseId/edit-quiz/:quizId" element={<Createquiz />} />

            </Route>
          </Route>
          {/* Redirect to login if no route matches */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;