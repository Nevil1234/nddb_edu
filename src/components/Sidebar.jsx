import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  GraduationCap, 
  ClipboardList, 
  Bell, 
  Star, 
  Cog, 
  FolderOpen,
  MessageSquare
} from 'lucide-react';

const menuItems = [
  {
    title: "Dashboard",
    icon: Cog,
    path: "/dashboard"
  },
  {
    title: "Courses",
    icon: GraduationCap,
    submenus: [
      { title: "All Courses", path: "/courses" },
      { title: "Add New Course", path: "/courses/add" },
      { title: "Course Requests", path: "/courses/requests" }
    ]
  },
  {
    title: "Enrollments",
    icon: ClipboardList,
    submenus: [
      { title: "Enrollment List", path: "/enrollments/list" },
      // { title: "Track Progress", path: "/enrollments/progress" },
      { title: "Completion Reports", path: "/enrollments/reports" }
    ]
  },
  {
    title: "Discussions / Q&A",
    icon: MessageSquare,
    submenus: [
      { title: "Monitor Questions", path: "/discussions/monitor" },
    ]
  },
  {
    title: "Analytics",
    icon: Star,
    submenus: [
      { title: "Course-wise Analytics", path: "/analytics/courses" },
    ]
  },
  {
    title: "Announcements",
    icon: Bell,
    submenus: [
      { title: "Send Announcement", path: "/announcements/send" },
    ]
  },
  {
    title: "Content Library",
    icon: FolderOpen,
    submenus: [
      { title: "Organize Materials", path: "/content/organize" }
    ]
  },
  {
    title: "Feedback & Reviews",
    icon: Star,
    submenus: [
      { title: "User Feedback", path: "/feedback/user" },
      { title: "Flag Reviews", path: "/feedback/flag" }
    ]
  },
  {
    title: "Settings",
    icon: Cog,
    submenus: [
      { title: "Platform Settings", path: "/settings/platform" },
    ]
  },
  {
    title: "Admin Management",
    icon: Users,
    submenus: [
      { title: "Role Management", path: "/admin/roles" }
    ]
  }
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [expandedItems, setExpandedItems] = useState(['Courses']);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleExpanded = (title) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (path) => location.pathname === path;
  const isParentActive = (submenus) =>
    submenus.some(submenu => location.pathname === submenu.path);

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
    `}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <div className="flex items-center">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-xl font-bold text-gray-800">LMS Admin</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <div key={item.title}>
              {item.path ? (
                <Link
                  to={item.path}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive(item.path)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.title}
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleExpanded(item.title)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors
                      ${item.submenus && isParentActive(item.submenus)
                        ? 'bg-blue-50 text-blue-100'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.title}
                    </div>
                    <span className={`transition-transform ${expandedItems.includes(item.title) ? 'rotate-90' : ''}`}>
                      ▶
                    </span>
                  </button>

                  {expandedItems.includes(item.title) && item.submenus && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.submenus.map((submenu) => (
                        <Link
                          key={submenu.path}
                          to={submenu.path}
                          className={`
                            block px-3 py-2 text-sm rounded-md transition-colors
                            ${isActive(submenu.path)
                              ? 'bg-blue-100 text-blue-700 font-medium'
                              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }
                          `}
                        >
                          {submenu.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2 mt-8 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors w-full"
          >
            <span className="mr-3">🚪</span>
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
