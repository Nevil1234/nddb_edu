import React from 'react';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Users, GraduationCap, ClipboardList, Star } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Courses',
      value: '124',
      icon: GraduationCap,
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Active Students',
      value: '2,847',
      icon: Users,
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: 'Total Enrollments',
      value: '5,672',
      icon: ClipboardList,
      change: '+23%',
      changeType: 'increase'
    },
    {
      title: 'Average Rating',
      value: '4.8',
      icon: Star,
      change: '+0.3',
      changeType: 'increase'
    }
  ];

  return (
    <div>
      <Breadcrumb />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your LMS today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className={`text-sm mt-2 ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Course Activity</h3>
          <div className="space-y-4">
            {[
              { course: 'React Fundamentals', action: 'New enrollment', time: '2 hours ago' },
              { course: 'Python for Beginners', action: 'Course completed', time: '4 hours ago' },
              { course: 'Data Science Basics', action: 'New review (5 stars)', time: '6 hours ago' },
              { course: 'JavaScript Advanced', action: 'Assignment submitted', time: '8 hours ago' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-900">{activity.course}</p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <span className="font-medium text-blue-900">Add New Course</span>
              <p className="text-sm text-blue-700">Create and publish a new course</p>
            </button>
            <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <span className="font-medium text-green-900">Send Announcement</span>
              <p className="text-sm text-green-700">Notify all users about updates</p>
            </button>
            <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <span className="font-medium text-purple-900">View Analytics</span>
              <p className="text-sm text-purple-700">Check platform performance</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
