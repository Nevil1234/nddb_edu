import React, { useState } from 'react';
import axios from 'axios';

const Modules = ({ courseId, courseName, apiBaseUrl }) => {
  // State to track multiple modules
  const [modules, setModules] = useState([
    {
      id: 1,
      title: '',
      description: '',
      contentFile: null,
      isSubmitting: false,
      error: null,
      createdModule: null
    }
  ]);
  
  // Handle input changes for a specific module
  const handleChange = (moduleId, e) => {
    const { name, value } = e.target;
    setModules(modules.map(module => 
      module.id === moduleId ? { ...module, [name]: value } : module
    ));
  };

  // Handle file input for a specific module
  const handleFileChange = (moduleId, e) => {
    setModules(modules.map(module => 
      module.id === moduleId ? { ...module, contentFile: e.target.files[0] } : module
    ));
  };

  // Add a new module form
  const addModuleForm = () => {
    const newId = Math.max(...modules.map(m => m.id)) + 1;
    setModules([
      ...modules, 
      {
        id: newId,
        title: '',
        description: '',
        contentFile: null,
        isSubmitting: false,
        error: null,
        createdModule: null
      }
    ]);
  };

  // Remove a module form
  const removeModuleForm = (moduleId) => {
    if (modules.length > 1) {
      setModules(modules.filter(module => module.id !== moduleId));
    }
  };

  // Handle form submission for a specific module
  // Handle form submission for a specific module
const handleSubmit = async (moduleId, e) => {
  e.preventDefault();
  
  // Update the specific module's submitting state
  setModules(modules.map(module => 
    module.id === moduleId ? { ...module, isSubmitting: true, error: null } : module
  ));
  
  try {
    const moduleToSubmit = modules.find(m => m.id === moduleId);
    
    // Create form data object to send files and text data
    const formData = new FormData();
    formData.append('courseId', courseId);
    formData.append('title', moduleToSubmit.title);
    formData.append('description', moduleToSubmit.description);
    
    if (moduleToSubmit.contentFile) {
      formData.append('contentFile', moduleToSubmit.contentFile);
    }

    // Send API request
    const response = await axios.post(
      `${apiBaseUrl}/api/modules`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    console.log("Module created successfully:", response.data);
    
    // Normalize the response structure to ensure it's consistent
    let normalizedResponse = response.data;
    
    // If response has nested data structure, ensure it's properly formatted
    if (!normalizedResponse.data && normalizedResponse.message === "Record created successfully") {
      // Format matches what you showed in the console log
      normalizedResponse = {
        ...normalizedResponse,
        data: {
          ...normalizedResponse.data,
          title: moduleToSubmit.title,
          description: moduleToSubmit.description,
          contentFile: normalizedResponse.data?.contentFile || ''
        }
      };
    }
    
    // Update the module with the created data and reset form fields
    setModules(modules.map(module => 
      module.id === moduleId ? { 
        ...module, 
        isSubmitting: false,
        createdModule: normalizedResponse,
        title: '',
        description: '',
        contentFile: null
      } : module
    ));

    // Reset file input
    const fileInput = document.getElementById(`contentFile-${moduleId}`);
    if (fileInput) fileInput.value = '';
    
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to create module. Please try again.';
    console.error('Error creating module:', err);
    
    // Update the specific module's error state
    setModules(modules.map(module => 
      module.id === moduleId ? { ...module, isSubmitting: false, error: errorMessage } : module
    ));
  }
};

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-blue-600">Add Modules for "{courseName}"</h2>
      
      {modules.map(module => (
        <div 
          key={module.id} 
          className="mb-8 pb-8 border-b border-gray-200 last:border-b-0 last:pb-0 last:mb-0"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Module #{module.id}</h3>
            {modules.length > 1 && (
              <button
                type="button"
                onClick={() => removeModuleForm(module.id)}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                Remove
              </button>
            )}
          </div>
          
          {module.error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
              <p>{module.error}</p>
            </div>
          )}
          
          <form onSubmit={(e) => handleSubmit(module.id, e)} className="mb-4">
            <div className="mb-4">
              <label htmlFor={`title-${module.id}`} className="block text-gray-700 text-sm font-bold mb-2">
                Module Title:
              </label>
              <input
                type="text"
                id={`title-${module.id}`}
                name="title"
                value={module.title}
                onChange={(e) => handleChange(module.id, e)}
                required
                placeholder="Enter module title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label htmlFor={`description-${module.id}`} className="block text-gray-700 text-sm font-bold mb-2">
                Description:
              </label>
              <textarea
                id={`description-${module.id}`}
                name="description"
                value={module.description}
                onChange={(e) => handleChange(module.id, e)}
                required
                placeholder="Enter module description"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label htmlFor={`contentFile-${module.id}`} className="block text-gray-700 text-sm font-bold mb-2">
                Content File:
              </label>
              <input
                type="file"
                id={`contentFile-${module.id}`}
                name="contentFile"
                onChange={(e) => handleFileChange(module.id, e)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button 
              type="submit" 
              className={`w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition
                ${module.isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={module.isSubmitting}
            >
              {module.isSubmitting ? 'Adding Module...' : 'Add This Module'}
            </button>
          </form>
          
          {module.createdModule && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md mt-4">
              <h4 className="font-bold text-green-700 mb-2">Module Created Successfully!</h4>
              <div className="bg-white p-3 rounded border border-gray-200">
                {/* Simplified logic to handle different response structures */}
                <p className="mb-1">
                  <span className="font-semibold">Title:</span> {
                    module.createdModule.data?.title || 
                    module.createdModule.title
                  }
                </p>
                <p className="mb-1">
                  <span className="font-semibold">Description:</span> {
                    module.createdModule.data?.description || 
                    module.createdModule.description
                  }
                </p>
                
                {/* Handle content file display with more robust checks */}
                {(module.createdModule.data?.contentFile || module.createdModule.contentFile) && (
                  <div className="mb-1">
                    <span className="font-semibold">Content File:</span>
                    
                    {/* Get the file path from wherever it exists in the response */}
                    {(() => {
                      const filePath = module.createdModule.data?.contentFile || module.createdModule.contentFile;
                      
                      if (filePath.includes('.pdf')) {
                        return (
                          <div className="mt-2">
                            <a 
                              href={`${apiBaseUrl}${filePath}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 underline"
                            >
                              View PDF Document
                            </a>
                          </div>
                        );
                      } else if (filePath.match(/\.(jpeg|jpg|png|gif)$/i)) {
                        return (
                          <div className="mt-2">
                            <img 
                              src={`${apiBaseUrl}${filePath}`}
                              alt="Module content" 
                              className="max-w-xs rounded-md shadow-sm border border-gray-200" 
                            />
                          </div>
                        );
                      } else if (filePath.match(/\.(mp4|webm|ogg)$/i)) {
                        return (
                          <div className="mt-2">
                            <video 
                              controls 
                              className="max-w-xs rounded-md shadow-sm border border-gray-200"
                              width="320"
                            >
                              <source 
                                src={`${apiBaseUrl}${filePath}`} 
                                type={`video/${filePath.split('.').pop()}`} 
                              />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        );
                      } else {
                        return (
                          <div className="mt-2">
                            <a 
                              href={`${apiBaseUrl}${filePath}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 underline"
                            >
                              Download File
                            </a>
                          </div>
                        );
                      }
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
      
      <div className="mt-6">
        <button 
          type="button"
          onClick={addModuleForm}
          className="w-full bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition"
        >
          + Add Another Module
        </button>
      </div>
    </div>
  );
};

export default Modules;
