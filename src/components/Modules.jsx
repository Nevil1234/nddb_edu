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
  
  // State for edit mode and modal
  const [editMode, setEditMode] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    contentFile: null,
    isSubmitting: false,
    error: null
  });
  
  // Handle input changes for a specific module
  const handleChange = (moduleId, e) => {
    const { name, value } = e.target;
    setModules(modules.map(module => 
      module.id === moduleId ? { ...module, [name]: value } : module
    ));
  };

  // Handle changes for new module in modal
  const handleNewModuleChange = (e) => {
    const { name, value } = e.target;
    setNewModule({
      ...newModule,
      [name]: value
    });
  };

  // Handle file input for a specific module
  const handleFileChange = (moduleId, e) => {
    setModules(modules.map(module => 
      module.id === moduleId ? { ...module, contentFile: e.target.files[0] } : module
    ));
  };

  // Handle file input for new module in modal
  const handleNewModuleFileChange = (e) => {
    setNewModule({
      ...newModule,
      contentFile: e.target.files[0]
    });
  };

  // Add a new module form
  const addModuleForm = () => {
    const newId = Math.max(...modules.map(m => m.id), 0) + 1;
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

  // Toggle edit mode for a specific module
  const toggleEditMode = (moduleId) => {
    if (editingModuleId === moduleId) {
      setEditingModuleId(null);
    } else {
      setEditingModuleId(moduleId);
    }
  };

  // Submit the new module from modal
  const handleNewModuleSubmit = async (e) => {
    e.preventDefault();
    
    setNewModule({
      ...newModule,
      isSubmitting: true,
      error: null
    });
    
    try {
      // Create form data object to send files and text data
      const formData = new FormData();
      formData.append('courseId', courseId);
      formData.append('title', newModule.title);
      formData.append('description', newModule.description);
      
      if (newModule.contentFile) {
        formData.append('contentFile', newModule.contentFile);
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
      
      // Normalize the response structure
      let normalizedResponse = response.data;
      
      // If response has nested data structure, ensure it's properly formatted
      if (!normalizedResponse.data && normalizedResponse.message === "Record created successfully") {
        normalizedResponse = {
          ...normalizedResponse,
          data: {
            ...normalizedResponse.data,
            title: newModule.title,
            description: newModule.description,
            contentFile: normalizedResponse.data?.contentFile || ''
          }
        };
      }
      
      // Create new module object with response data
      const newId = Math.max(...modules.map(m => m.id), 0) + 1;
      const createdModule = {
        id: newId,
        title: newModule.title,
        description: newModule.description,
        contentFile: null,
        isSubmitting: false,
        error: null,
        createdModule: normalizedResponse
      };
      
      // Add the new module to the list
      setModules([...modules, createdModule]);
      
      // Reset modal and form
      setNewModule({
        title: '',
        description: '',
        contentFile: null,
        isSubmitting: false,
        error: null
      });
      setShowModal(false);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create module. Please try again.';
      console.error('Error creating module:', err);
      
      setNewModule({
        ...newModule,
        isSubmitting: false,
        error: errorMessage
      });
    }
  };

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

      // Check if we're editing an existing module
      if (moduleToSubmit.createdModule && moduleToSubmit.createdModule.data?._id) {
        // Update existing module
        formData.append('moduleId', moduleToSubmit.createdModule.data._id);
        
        const response = await axios.put(
          `${apiBaseUrl}/api/modules/${moduleToSubmit.createdModule.data._id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        console.log("Module updated successfully:", response.data);
        
        // Update the module in state
        setModules(modules.map(module => 
          module.id === moduleId ? { 
            ...module, 
            isSubmitting: false,
            createdModule: {
              ...module.createdModule,
              data: {
                ...module.createdModule.data,
                title: moduleToSubmit.title,
                description: moduleToSubmit.description,
                contentFile: response.data.data?.contentFile || module.createdModule.data.contentFile
              }
            }
          } : module
        ));
        
        // Exit edit mode
        setEditingModuleId(null);
      } else {
        // Create new module
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
      }

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

  // Modal component for adding new module
  const ModuleModal = () => {
    if (!showModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Add New Module</h3>
            <button 
              onClick={() => setShowModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          {newModule.error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
              <p>{newModule.error}</p>
            </div>
          )}
          
          <form onSubmit={handleNewModuleSubmit}>
            <div className="mb-4">
              <label htmlFor="modal-title" className="block text-gray-700 text-sm font-bold mb-2">
                Module Title:
              </label>
              <input
                type="text"
                id="modal-title"
                name="title"
                value={newModule.title}
                onChange={handleNewModuleChange}
                required
                placeholder="Enter module title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="modal-description" className="block text-gray-700 text-sm font-bold mb-2">
                Description:
              </label>
              <textarea
                id="modal-description"
                name="description"
                value={newModule.description}
                onChange={handleNewModuleChange}
                required
                placeholder="Enter module description"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="modal-contentFile" className="block text-gray-700 text-sm font-bold mb-2">
                Content File:
              </label>
              <input
                type="file"
                id="modal-contentFile"
                name="contentFile"
                onChange={handleNewModuleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={`bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition
                  ${newModule.isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={newModule.isSubmitting}
              >
                {newModule.isSubmitting ? 'Adding...' : 'Add Module'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-blue-600">Modules for "{courseName}"</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-2 rounded-md font-medium transition ${
              editMode 
                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {editMode ? 'Exit Edit Mode' : 'Edit Modules'}
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition"
          >
            Add New Module
          </button>
        </div>
      </div>
      
      {/* Modal for adding new module */}
      <ModuleModal />
      
      {modules.map(module => (
        <div 
          key={module.id} 
          className="mb-8 pb-8 border-b border-gray-200 last:border-b-0 last:pb-0 last:mb-0"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Module #{module.id}</h3>
            
            <div className="flex gap-2">
              {module.createdModule && editMode && (
                <button
                  type="button"
                  onClick={() => toggleEditMode(module.id)}
                  className={`text-blue-500 hover:text-blue-700 font-medium ${
                    editingModuleId === module.id ? 'text-blue-700' : ''
                  }`}
                >
                  {editingModuleId === module.id ? 'Cancel Edit' : 'Edit'}
                </button>
              )}
              
              {modules.length > 1 && !module.createdModule && (
                <button
                  type="button"
                  onClick={() => removeModuleForm(module.id)}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          
          {module.error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
              <p>{module.error}</p>
            </div>
          )}
          
          {/* Show form if creating new module or editing existing one */}
          {(!module.createdModule || editingModuleId === module.id) && (
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
                {module.isSubmitting 
                  ? (module.createdModule ? 'Saving Changes...' : 'Adding Module...') 
                  : (module.createdModule ? 'Save Changes' : 'Add This Module')}
              </button>
            </form>
          )}
          
          {/* Display module info if already created and not in edit mode */}
          {module.createdModule && editingModuleId !== module.id && (
            <div className={`bg-gray-50 p-4 rounded-md ${editMode ? 'border-2 border-blue-200' : ''}`}>
              <h4 className="font-bold text-gray-800 mb-2">
                {module.createdModule.data?.title || module.createdModule.title || 'Module Title'}
              </h4>
              <p className="text-gray-600 mb-3">
                {module.createdModule.data?.description || module.createdModule.description || 'No description provided.'}
              </p>
              
              {/* Handle content file display with more robust checks */}
              {(module.createdModule.data?.contentFile || module.createdModule.contentFile) && (
                <div className="mt-3">
                  <p className="font-semibold text-gray-700 mb-2">Content File:</p>
                  
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
          )}
        </div>
      ))}
      
      {!editMode && (
        <div className="mt-6">
          <button 
            type="button"
            onClick={addModuleForm}
            className="w-full bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition"
          >
            + Add Another Module
          </button>
        </div>
      )}
    </div>
  );
};

export default Modules;
