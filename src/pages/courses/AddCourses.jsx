import React, { useState } from 'react';
import Breadcrumb from '../../components/Layout/Breadcrumb';
import { Star, Upload, Save, X } from 'lucide-react';

const AddCourse = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    rating: 0,
    price: '',
    duration: '',
    level: 'Beginner'
  });

  const [files, setFiles] = useState({
    video: null,
    audio: null,
    pdf: null,
    thumbnail: null
  });

  const categories = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'Programming',
    'Design',
    'Business',
    'Marketing',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (type, file) => {
    setFiles(prev => ({
      ...prev,
      [type]: file
    }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    console.log('Files:', files);
    alert('Course created successfully!');
  };

  const renderStarSelector = () => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleRatingChange(star)}
          className="focus:outline-none"
        >
          <Star
            className={`h-6 w-6 ${
              star <= formData.rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300 hover:text-yellow-400'
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600">
        {formData.rating > 0 ? `${formData.rating} star${formData.rating > 1 ? 's' : ''}` : 'No rating'}
      </span>
    </div>
  );

  const renderFileUpload = (type, label, accept) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          accept={accept}
          onChange={(e) => handleFileChange(type, e.target.files?.[0] || null)}
          className="hidden"
          id={`file-${type}`}
        />
        <label htmlFor={`file-${type}`} className="cursor-pointer">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-2">
            <span className="text-sm text-gray-600">
              Click to upload or drag and drop
            </span>
          </div>
        </label>
        {files[type] && (
          <div className="mt-2 flex items-center justify-center space-x-2">
            <span className="text-sm text-green-600">{files[type].name}</span>
            <button
              type="button"
              onClick={() => handleFileChange(type, null)}
              className="text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <Breadcrumb />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Course</h1>
        <p className="text-gray-600 mt-2">Create a new course for your learning platform</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter course title"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter course description"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Price ($)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Duration (hours)
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Course duration in hours"
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter tags separated by commas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Rating
              </label>
              {renderStarSelector()}
            </div>
          </div>
        </div>

        {/* Content Upload */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Content</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderFileUpload('thumbnail', 'Course Thumbnail', 'image/*')}
            {renderFileUpload('video', 'Video Content', 'video/*')}
            {renderFileUpload('audio', 'Audio Content', 'audio/*')}
            {renderFileUpload('pdf', 'PDF Materials', '.pdf')}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Publish Course</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCourse;
