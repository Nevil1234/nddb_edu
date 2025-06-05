import React, { useState } from 'react';
import axios from 'axios';
import Modules from '../../components/Modules';

const AddCourses = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active', // Default value
    thumbnail: null
  });
  
  // State for created course and loading status
  const [createdCourse, setCreatedCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // API base URL
  const API_BASE_URL = 'https://nddb-lms.onrender.com';

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle file input for thumbnail
  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      thumbnail: e.target.files[0]
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setCreatedCourse(null); // Reset previous course details

    try {
      // Create form data object to send files
      const courseData = new FormData();
      courseData.append('title', formData.title);
      courseData.append('description', formData.description);
      courseData.append('status', formData.status);
      if (formData.thumbnail) {
        courseData.append('thumbnail', formData.thumbnail);
      }

      // Send API request
      const response = await axios.post(
        `${API_BASE_URL}/api/courses`,
        courseData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Set the created course in state - handle both response formats
      setCreatedCourse(response.data);
      console.log("Course created successfully:", response.data);
      
      // Reset file input
      const fileInput = document.getElementById('thumbnail');
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course. Please try again.');
      console.error('Error creating course:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get the course data from the response structure
  const courseData = createdCourse?.data || createdCourse;
  
  // Construct full thumbnail URL if available
  const thumbnailUrl = courseData?.thumbnail 
    ? `${API_BASE_URL}${courseData.thumbnail}`
    : null;

  // Get course ID and title for the modules form
  const courseId = courseData?._id;
  const courseTitle = courseData?.title;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Add New Course</h1>
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mb-6">
        {/* Form fields remain the same */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
            Course Title:
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter course title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
            Description:
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Enter course description"
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">
            Status:
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="thumbnail" className="block text-gray-700 text-sm font-bold mb-2">
            Thumbnail:
          </label>
          <input
            type="file"
            id="thumbnail"
            name="thumbnail"
            onChange={handleFileChange}
            accept="image/*"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button 
          type="submit" 
          className={`w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Course'}
        </button>
      </form>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
          <p>{error}</p>
        </div>
      )}

      {createdCourse && (
        <>
          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold text-green-700 mb-4">
              {createdCourse.message || "Course Created Successfully!"}
            </h2>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <p className="mb-2"><span className="font-bold">Status:</span> {createdCourse.status}</p>
              {courseData && (
                <>
                  <p className="mb-2"><span className="font-bold">Title:</span> {courseData.title}</p>
                  <p className="mb-2"><span className="font-bold">Description:</span> {courseData.description}</p>
                  <p className="mb-2"><span className="font-bold">Course Status:</span> {courseData.status}</p>
                  {courseData.createdAt && (
                    <p className="mb-2"><span className="font-bold">Created At:</span> {new Date(courseData.createdAt).toLocaleString()}</p>
                  )}
                  
                  {thumbnailUrl && (
                    <div className="mt-4">
                      <p className="font-bold mb-2">Thumbnail:</p>
                      <img 
                        src={thumbnailUrl}
                        alt="Course thumbnail" 
                        className="max-w-xs rounded-md shadow-sm border border-gray-200" 
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Module form component - only shown after course creation */}
          {courseId && (
            <Modules 
              courseId={courseId} 
              courseName={courseTitle} 
              apiBaseUrl={API_BASE_URL}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AddCourses;