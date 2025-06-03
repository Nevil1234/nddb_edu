import React, { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import PrivateRoute from './components/PrivateRoute';
// Course routes
import AllCourses from './pages/courses/AllCourses';
import AddCourses from './pages/courses/AddCourses';
import CourseRequest from './pages/courses/CourseRequest';

// Enrollment routes
import ProgressReports from "./pages/enrollments/ProgressReports";
// Import correct component or create a placeholder
import EnrollmentList from "./pages/enrollments/EnList"; 

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
import EnList from "./pages/enrollments/EnList";

// Main App Component
function App() {
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Check if user is on admin pages (dashboard or any other admin route)
  const isAdminRoute = (path) => {
    return path.startsWith('/dashboard') || 
           path.includes('/courses') || 
           path.includes('/users') ||
           path.includes('/enrollments') ||
           path.includes('/discussions') ||
           path.includes('/analytics') ||
           path.includes('/announcements') ||
           path.includes('/content') ||
           path.includes('/feedback') ||
           path.includes('/settings') ||
           path.includes('/admin');
  };
  
  // Update sidebar visibility whenever location changes
  useEffect(() => {
    setShowSidebar(isAdminRoute(location.pathname));
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-grow">
        {showSidebar && <Sidebar />}
        <main className={`flex-grow ${showSidebar ? 'ml-0 md:ml-64 p-4' : ''}`}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
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
            </Route>
            
            {/* Redirect to login if no route matches */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default App;
