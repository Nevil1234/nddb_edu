import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Container, Typography, Grid, Button, CircularProgress,
  Card, CardContent, Divider, List, ListItem, ListItemIcon,
  ListItemText, Chip, Tabs, Tab, Avatar, useTheme, useMediaQuery,
  Alert, Breadcrumbs, Link, Paper, Collapse, IconButton, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle,
  Fade, Zoom, TextField, Modal
} from '@mui/material';
import {
  PlayCircleOutline, CheckCircle, PeopleAlt, QuestionAnswer,
  ArrowBack, School, Description, Videocam, Assignment, 
  CalendarToday, Update, KeyboardArrowDown, KeyboardArrowUp,
  Chat, Edit, Delete, Add, Close, Visibility
} from '@mui/icons-material';

// Import the new DiscussionForum component
import DiscussionForum from '../../components/DiscussionForum';

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseDetail, setCourseDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  // Add state for detailed quiz data
  const [detailedQuizzes, setDetailedQuizzes] = useState({});
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  // Add state for expanded questions
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // New states for module management
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [moduleToEdit, setModuleToEdit] = useState(null);
  const [moduleFormData, setModuleFormData] = useState({
    title: '',
    description: '',
    contentFile: null
  });
  const [moduleSubmitting, setModuleSubmitting] = useState(false);
  const [moduleError, setModuleError] = useState(null);
  
  // Add new state for content modal
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://nddb-lms.onrender.com/api/join/courses/${courseId}`);
        setCourseDetail(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch course details. Please try again later.');
        setLoading(false);
        console.error('Error fetching course details:', err);
      }
    };
    
    fetchCourseDetail();
  }, [courseId]);

  const handleTabChange = (event, newValue) => {
    setSelectedTabIndex(newValue);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Add a function to fetch detailed quiz data
  const fetchQuizDetails = async (quizId) => {
    // Skip if we already have the data
    if (detailedQuizzes[quizId]) return;
    
    try {
      setLoadingQuizzes(true);
      const response = await axios.get(`https://nddb-lms.onrender.com/api/join/quizzes/${quizId}`);
      setDetailedQuizzes(prev => ({
        ...prev,
        [quizId]: response.data.data
      }));
      setLoadingQuizzes(false);
    } catch (err) {
      console.error('Error fetching quiz details:', err);
      setLoadingQuizzes(false);
    }
  };

  const toggleQuestion = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Handle quiz deletion
  const handleDeleteQuiz = async () => {
    if (!quizToDelete) return;
    
    try {
      setDeleteLoading(true);
      await axios.delete(`https://nddb-lms.onrender.com/api/quizzes/${quizToDelete._id}`);
      
      // Update local state to remove the deleted quiz
      setCourseDetail(prev => ({
        ...prev,
        quizzes: prev.quizzes.filter(quiz => quiz._id !== quizToDelete._id)
      }));
      
      // Close dialog
      setDeleteDialogOpen(false);
      setQuizToDelete(null);
      setDeleteLoading(false);
    } catch (err) {
      console.error('Error deleting quiz:', err);
      setDeleteLoading(false);
      // You may want to show an error message here
    }
  };

  // Handle edit quiz (redirect to edit page)
  const handleEditQuiz = (quiz) => {
    navigate(`/courses/${courseId}/edit-quiz/${quiz._id}`);
  };

  // Reset module form
  const resetModuleForm = () => {
    setModuleFormData({
      title: '',
      description: '',
      contentFile: null
    });
    setModuleToEdit(null);
    setModuleError(null);
  };

  // Handle module modal open
  const handleOpenModuleModal = (module = null) => {
    if (module) {
      // If editing existing module
      setModuleToEdit(module);
      setModuleFormData({
        title: module.title,
        description: module.description,
        contentFile: null // We don't populate the file input when editing
      });
    } else {
      // If creating new module
      resetModuleForm();
    }
    setModuleModalOpen(true);
  };

  // Handle module modal close
  const handleCloseModuleModal = () => {
    setModuleModalOpen(false);
    resetModuleForm();
  };

  // Handle module form input changes
  const handleModuleFormChange = (e) => {
    const { name, value } = e.target;
    setModuleFormData({
      ...moduleFormData,
      [name]: value
    });
  };

  // Handle module file input changes
  const handleModuleFileChange = (e) => {
    setModuleFormData({
      ...moduleFormData,
      contentFile: e.target.files[0]
    });
  };

  // Handle module form submission
  const handleModuleSubmit = async (e) => {
    e.preventDefault();
    setModuleSubmitting(true);
    setModuleError(null);
    
    try {
      const formData = new FormData();
      formData.append('courseId', courseId);
      formData.append('title', moduleFormData.title);
      formData.append('description', moduleFormData.description);
      
      if (moduleFormData.contentFile) {
        formData.append('contentFile', moduleFormData.contentFile);
      }
      
      let response;
      
      if (moduleToEdit) {
        // Update existing module
        response = await axios.put(
          `https://nddb-lms.onrender.com/api/modules/${moduleToEdit._id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        // Update the module in course detail
        setCourseDetail(prev => ({
          ...prev,
          modules: prev.modules.map(mod => 
            mod._id === moduleToEdit._id 
              ? { 
                  ...mod, 
                  title: moduleFormData.title, 
                  description: moduleFormData.description,
                  ...(response.data.data?.content && { content: response.data.data.content })
                } 
              : mod
          )
        }));
      } else {
        // Create new module
        response = await axios.post(
          'https://nddb-lms.onrender.com/api/modules',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        // Add the new module to course detail
        if (response.data.data) {
          setCourseDetail(prev => ({
            ...prev,
            modules: [...(prev.modules || []), response.data.data]
          }));
        }
      }
      
      // Close modal and reset form
      setModuleModalOpen(false);
      resetModuleForm();
      setModuleSubmitting(false);
      
      // Show success message or update UI as needed
      
    } catch (err) {
      console.error('Error submitting module:', err);
      setModuleError(err.response?.data?.message || 'Failed to save module. Please try again.');
      setModuleSubmitting(false);
    }
  };

  // Function to determine content type from file extension
  const getContentTypeFromPath = (filePath) => {
    if (!filePath) return null;
    
    const extension = filePath.split('.').pop().toLowerCase();
    
    const typeMap = {
      // Images
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      // Videos
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'ogg': 'video/ogg',
      'mov': 'video/quicktime',
      // Audio
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      // Documents
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      // Text
      'txt': 'text/plain',
      'csv': 'text/csv',
      'html': 'text/html',
    };
    
    return typeMap[extension] || 'application/octet-stream'; // Default to binary file type
  };

  // Modified function to handle opening content modal with contentFile path
  const handleOpenContentModal = (module) => {
    if (!module || !module.contentFile) return;
    
    const contentType = getContentTypeFromPath(module.contentFile);
    const contentUrl = `https://nddb-lms.onrender.com${module.contentFile}`;
    
    setSelectedContent({
      type: contentType,
      url: contentUrl,
      title: module.title
    });
    
    setContentModalOpen(true);
  };
  
  
  // Add function to handle closing content modal
  const handleCloseContentModal = () => {
    setContentModalOpen(false);
    setSelectedContent(null);
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh',
        flexDirection: 'column',
        gap: 3
      }}>
        <CircularProgress size={60} sx={{ 
          color: 'primary.main',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          }
        }} />
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
          Loading course details...
        </Typography>
      </Box>
    );
  }

  if (error || !courseDetail) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Box sx={{ mb: 3 }}>
          <Button 
            startIcon={<ArrowBack />} 
            onClick={handleGoBack}
            sx={{ 
              mb: 2,
              borderRadius: 2,
              px: 3,
              py: 1,
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateX(-5px)'
              }
            }}
          >
            Back to Courses
          </Button>
        </Box>
        <Alert 
          severity="error" 
          sx={{ 
            width: '100%', 
            borderRadius: 2, 
            boxShadow: 2,
            fontSize: '1rem'
          }}
        >
          {error || 'Failed to load course details. Please try again.'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ 
        mb: 3,
        '& .MuiBreadcrumbs-separator': {
          mx: 1.5
        },
        '& .MuiTypography-root': {
          fontSize: '0.95rem'
        }
      }}>
        <Link 
          color="inherit" 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            navigate('/courses');
          }}
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          Courses
        </Link>
        <Typography color="text.primary">{courseDetail.title}</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={handleGoBack}
          variant="outlined"
          sx={{ 
            mb: 3,
            borderRadius: 2,
            px: 3,
            py: 1,
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'translateX(-5px)'
            }
          }}
        >
          Back to Courses
        </Button>
        
        <Zoom in={true} timeout={500}>
          <Paper elevation={3} sx={{ 
            p: { xs: 2, md: 4 }, 
            borderRadius: 3, 
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            border: '1px solid rgba(230,230,230,0.9)'
          }}>
            <Typography variant="h4" component="h1" sx={{ 
              fontWeight: 700, 
              mb: 3,
              background: 'linear-gradient(90deg, #1a237e, #42a5f5)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px'
            }}>
              {courseDetail.title}
            </Typography>

            <Box sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row', 
              gap: 4, 
              mb: 4
            }}>
              <Fade in={true} timeout={700}>
                <Box sx={{ 
                  flex: isMobile ? 'none' : '0 0 40%', 
                  borderRadius: 3, 
                  overflow: 'hidden',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}>
                  <img 
                    src={courseDetail.thumbnail ? `https://nddb-lms.onrender.com${courseDetail.thumbnail}` : 'https://via.placeholder.com/500x300?text=Course+Thumbnail'}
                    alt={courseDetail.title}
                    style={{ 
                      width: '100%', 
                      height: 'auto', 
                      borderRadius: 12, 
                      display: 'block'
                    }}
                  />
                </Box>
              </Fade>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" paragraph sx={{ 
                  fontSize: '1.05rem',
                  lineHeight: 1.7,
                  color: 'text.primary',
                  mb: 3
                }}>
                  {courseDetail.description}
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item>
                    <Chip 
                      icon={<School />} 
                      label={`Status: ${courseDetail.status.charAt(0).toUpperCase() + courseDetail.status.slice(1)}`}
                      color={courseDetail.status === 'active' ? 'success' : 'default'}
                      sx={{ 
                        borderRadius: 3,
                        px: 1,
                        '& .MuiChip-icon': { ml: 1 }
                      }}
                    />
                  </Grid>
                  <Grid item>
                    <Chip 
                      icon={<PeopleAlt />} 
                      label={`Enrollments: ${courseDetail.enrollments?.length || 0}`}
                      color="primary"
                      sx={{ 
                        borderRadius: 3,
                        px: 1,
                        background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                        '& .MuiChip-icon': { ml: 1 }
                      }}
                    />
                  </Grid>
                  <Grid item>
                    <Chip 
                      icon={<Videocam />} 
                      label={`Modules: ${courseDetail.modules?.length || 0}`}
                      color="secondary"
                      sx={{ 
                        borderRadius: 3,
                        px: 1,
                        background: 'linear-gradient(45deg, #9c27b0, #ba68c8)',
                        '& .MuiChip-icon': { ml: 1 }
                      }}
                    />
                  </Grid>
                  <Grid item>
                    <Chip 
                      icon={<QuestionAnswer />} 
                      label={`Quizzes: ${courseDetail.quizzes?.length || 0}`}
                      color="info"
                      sx={{ 
                        borderRadius: 3,
                        px: 1,
                        background: 'linear-gradient(45deg, #0288d1, #29b6f6)',
                        '& .MuiChip-icon': { ml: 1 }
                      }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  gap: 3, 
                  mt: 2,
                  bgcolor: 'rgba(0,0,0,0.02)',
                  p: 2,
                  borderRadius: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday fontSize="small" color="primary" />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Created: {formatDate(courseDetail.createdAt)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Update fontSize="small" color="primary" />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Updated: {formatDate(courseDetail.updatedAt)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Zoom>
      </Box>

      <Paper elevation={3} sx={{ 
        borderRadius: 3, 
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        border: '1px solid rgba(230,230,230,0.9)'
      }}>
        <Tabs 
          value={selectedTabIndex} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': { 
              fontWeight: 600,
              py: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.04)'
              }
            },
            '& .Mui-selected': {
              color: 'primary.main',
              bgcolor: 'rgba(25, 118, 210, 0.08)'
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0'
            },
            borderBottom: 1, 
            borderColor: 'divider',
          }}
        >
          <Tab label="Modules" icon={<Videocam />} iconPosition="start" />
          <Tab label="Quizzes" icon={<Assignment />} iconPosition="start" />
          <Tab label="Enrollments" icon={<PeopleAlt />} iconPosition="start" />
          <Tab label="Discussion" icon={<Chat />} iconPosition="start" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Modules Tab */}
          {selectedTabIndex === 0 && (
            <>
              {/* Add Module Button */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                  Course Modules
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<Add />}
                  onClick={() => handleOpenModuleModal()}
                  sx={{
                    background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                    borderRadius: 2,
                    boxShadow: 2,
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                    }
                  }}
                >
                  Create New Module
                </Button>
              </Box>

              {/* Modules List */}
              <List disablePadding>
                {courseDetail.modules?.length > 0 ? (
                  courseDetail.modules.map((module, index) => (
                    <React.Fragment key={module._id}>
                      {index > 0 && <Divider variant="inset" component="li" />}
                      <ListItem 
                        sx={{
                          py: 2,
                          borderRadius: 1,
                          alignItems: 'flex-start',
                          '&:hover': { bgcolor: 'action.hover' },
                          flexDirection: 'column',
                          gap: 1.5,
                        }}
                      >
                        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex' }}>
                            <ListItemIcon sx={{ mt: 0.5 }}>
                              <PlayCircleOutline color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={module.title} 
                              secondary={
                                <>
                                  <Typography component="span" variant="body2" color="text.primary">
                                    {module.description}
                                  </Typography>
                                  <br />
                                  <Typography component="span" variant="caption" color="text.secondary">
                                    Added on {formatDate(module.createdAt)}
                                  </Typography>
                                </>
                              }
                            />
                          </Box>
                          <Box>
                            
                            {module.contentFile && (
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                startIcon={<Visibility />}
                                onClick={() => handleOpenContentModal(module)}
                                sx={{ mr: 1 }}
                              >
                                View Content
                              </Button>
                            )}
                            <IconButton 
                              onClick={() => handleOpenModuleModal(module)}
                              color="primary"
                              size="small"
                              sx={{ ml: 1 }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </ListItem>
                    </React.Fragment>
                  ))
                ) : (
                  <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                    No modules available for this course yet. Create a new module to get started.
                  </Typography>
                )}
              </List>
            </>
          )}

          {/* Quizzes Tab */}
          {selectedTabIndex === 1 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<Assignment />}
                  onClick={() => navigate(`/courses/${courseId}/create-quiz`)}
                  sx={{
                    background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                    borderRadius: 2,
                    boxShadow: 2,
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                    }
                  }}
                >
                  Create New Quiz
                </Button>
              </Box>
              
              {courseDetail.quizzes?.length > 0 ? (
                courseDetail.quizzes.map((quizBasic, index) => {
                  // Get detailed quiz data if available
                  const quiz = detailedQuizzes[quizBasic._id] || quizBasic;
                  const isLoaded = !!detailedQuizzes[quizBasic._id];
                  const isExpanded = !!expandedQuestions[quizBasic._id];
                  
                  return (
                    <Paper 
                      key={quiz._id} 
                      elevation={1} 
                      sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <Box 
                        sx={{ 
                          px: 3, 
                          py: 2, 
                          display: 'flex', 
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          bgcolor: '#242f8c',
                          color: 'white',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Assignment />
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {quiz.title}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {/* <Chip 
                            label={`${quiz.questions?.length || 0} Questions`}
                            size="small"
                            sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white' }}
                          /> */}
                          <IconButton 
                            size="small"
                            color="inherit"
                            onClick={() => {
                              if (!isLoaded) {
                                fetchQuizDetails(quizBasic._id);
                              }
                              setExpandedQuestions(prev => ({
                                ...prev,
                                [quizBasic._id]: !prev[quizBasic._id]
                              }));
                            }}
                            aria-label="Toggle questions"
                          >
                            {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditQuiz(quiz)}
                            sx={{ color: 'white' }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              setQuizToDelete(quiz);
                              setDeleteDialogOpen(true);
                            }}
                            sx={{ color: 'white' }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Box sx={{ p: 3 }}>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {quiz.description}
                        </Typography>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Collapse in={isExpanded}>
                          {isLoaded ? (
                            quiz.questions?.length > 0 ? (
                              <Box component="ul" sx={{ pl: 0, listStyleType: 'none' }}>
                                {quiz.questions.map((question, qIndex) => {
                                  const questionId = question._id || `q-${qIndex}-${quiz._id}`;
                                  const isQuestionExpanded = !!expandedQuestions[questionId];
                                  
                                  return (
                                    <Box 
                                      component="li" 
                                      key={questionId}
                                      sx={{
                                        mb: 3,
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: 'background.paper',
                                        boxShadow: 1,
                                      }}
                                    >
                                      {/* Question content - same as before */}
                                      <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
                                        p: 1,
                                        borderRadius: 1
                                      }}
                                      onClick={() => toggleQuestion(questionId)}
                                      >
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                          <Typography 
                                            component="span" 
                                            sx={{ 
                                              minWidth: 24, 
                                              height: 24, 
                                              borderRadius: '50%', 
                                              bgcolor: 'primary.main', 
                                              color: 'white',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              fontWeight: 600,
                                            }}
                                          >
                                            {qIndex + 1}
                                          </Typography>
                                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            {question.questionText || question.text}
                                          </Typography>
                                        </Box>
                                        
                                        <IconButton size="small">
                                          {isQuestionExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                        </IconButton>
                                      </Box>
                                      
                                      {question.media && (
                                        <Box sx={{ my: 2, maxWidth: 500 }}>
                                          {question.media.type?.startsWith('image/') ? (
                                            <img 
                                              src={question.media.url} 
                                              alt="Question media"
                                              style={{ maxWidth: '100%', borderRadius: 8 }}
                                            />
                                          ) : question.media.type?.startsWith('video/') ? (
                                            <video 
                                              controls 
                                              src={question.media.url}
                                              style={{ maxWidth: '100%', borderRadius: 8 }}
                                            >
                                              Your browser does not support video playback.
                                            </video>
                                          ) : null}
                                        </Box>
                                      )}
                                      
                                      <Collapse in={isQuestionExpanded}>
                                        <Box component="ol" sx={{ mt: 2 }}>
                                          {(() => {
                                            // Parse options if they're stored as a string
                                            let parsedOptions = question.options;
                                            if (typeof question.options === 'string') {
                                              try {
                                                parsedOptions = JSON.parse(question.options);
                                              } catch (error) {
                                                console.error('Error parsing options:', error);
                                                return <Typography color="error">Error displaying options</Typography>;
                                              }
                                            }
                                            
                                            return Array.isArray(parsedOptions) ? parsedOptions.map((option, oIndex) => (
                                              <Box 
                                                component="li" 
                                                key={oIndex}
                                                sx={{
                                                  mb: 1,
                                                  p: 1,
                                                  borderRadius: 1,
                                                  bgcolor: option === question.correctAnswer 
                                                    ? 'success.light' 
                                                    : 'grey.100',
                                                  color: option === question.correctAnswer 
                                                    ? 'white' 
                                                    : 'text.primary',
                                                }}
                                              >
                                                {option}
                                                {option === question.correctAnswer && (
                                                  <Chip 
                                                    label="Correct" 
                                                    size="small" 
                                                    color="success"
                                                    sx={{ ml: 1, height: 20 }}
                                                  />
                                                )}
                                              </Box>
                                            )) : (
                                              <Typography color="error">No options available</Typography>
                                            );
                                          })()}
                                        </Box>
                                      </Collapse>
                                    </Box>
                                  );
                                })}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                No questions available for this quiz yet.
                              </Typography>
                            )
                          ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                              <CircularProgress size={30} />
                            </Box>
                          )}
                        </Collapse>
                        
                        {/* {!isExpanded && (
                          <Box sx={{ textAlign: 'center', py: 2 }}>
                            <Button
                              variant="outlined"
                              onClick={() => {
                                if (!isLoaded) {
                                  fetchQuizDetails(quizBasic._id);
                                }
                                setExpandedQuestions(prev => ({
                                  ...prev,
                                  [quizBasic._id]: true
                                }));
                              }}
                              startIcon={loadingQuizzes && !isLoaded ? <CircularProgress size={20} /> : <KeyboardArrowDown />}
                            >
                            </Button>
                          </Box>
                        )} */}
                      </Box>
                    </Paper>
                  );
                })
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No quizzes available for this course yet.
                </Typography>
              )}
            </>
          )}

          {/* Enrollments Tab */}
          {selectedTabIndex === 2 && (
            <List disablePadding>
              {courseDetail.enrollments?.length > 0 ? (
                courseDetail.enrollments.map((enrollment, index) => (
                  <React.Fragment key={enrollment._id}>
                    {index > 0 && <Divider variant="inset" component="li" />}
                    <ListItem 
                      sx={{
                        py: 2,
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {enrollment.userId.substring(0, 2).toUpperCase()}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary={`User ID: ${enrollment.userId}`}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.secondary">
                              Status: {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                            </Typography>
                            <br />
                            <Typography component="span" variant="caption" color="text.secondary">
                              Enrolled on: {formatDate(enrollment.enrolledAt)}
                            </Typography>
                          </>
                        }
                      />
                      <Chip 
                        label={enrollment.status} 
                        size="small" 
                        color={enrollment.status === 'active' ? 'success' : 'default'}
                      />
                    </ListItem>
                  </React.Fragment>
                ))
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No enrollments for this course yet.
                </Typography>
              )}
            </List>
          )}

          {/* Chat/Discussion Tab - Replace with the new component */}
          {selectedTabIndex === 3 && (
            <DiscussionForum courseId={courseId} />
          )}
        </Box>
      </Paper>

      {/* Module Modal */}
      <Modal
        open={moduleModalOpen}
        onClose={handleCloseModuleModal}
        aria-labelledby="module-modal-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 500 },
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography id="module-modal-title" variant="h6" component="h2">
              {moduleToEdit ? 'Edit Module' : 'Create New Module'}
            </Typography>
            <IconButton onClick={handleCloseModuleModal} size="small">
              <Close />
            </IconButton>
          </Box>
          
          {moduleError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {moduleError}
            </Alert>
          )}
          
          <form onSubmit={handleModuleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Module Title"
              name="title"
              value={moduleFormData.title}
              onChange={handleModuleFormChange}
              required
              variant="outlined"
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Description"
              name="description"
              value={moduleFormData.description}
              onChange={handleModuleFormChange}
              required
              multiline
              rows={4}
              variant="outlined"
            />
            
            <Box sx={{ mt: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Content File {moduleToEdit && '(leave empty to keep current file)'}
              </Typography>
              <input
                type="file"
                onChange={handleModuleFileChange}
                style={{ width: '100%' }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button 
                onClick={handleCloseModuleModal} 
                disabled={moduleSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                variant="contained" 
                color="primary"
                disabled={moduleSubmitting}
                startIcon={moduleSubmitting ? <CircularProgress size={20} /> : null}
              >
                {moduleSubmitting ? 'Saving...' : moduleToEdit ? 'Save Changes' : 'Create Module'}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Delete Quiz Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Delete Quiz
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the quiz "{quizToDelete?.title}"? 
            This action cannot be undone and will remove all associated questions.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteQuiz} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading && <CircularProgress size={20} color="inherit" />}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Content Modal */}
      <Modal
        open={contentModalOpen}
        onClose={handleCloseContentModal}
        aria-labelledby="content-modal-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: '80%', md: '70%' },
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          overflow: 'auto'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography id="content-modal-title" variant="h6" component="h2">
              {selectedContent?.title}
            </Typography>
            <IconButton onClick={handleCloseContentModal} size="small">
              <Close />
            </IconButton>
          </Box>
          
          {selectedContent && (
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              {/* Image Content */}
              {selectedContent.type?.startsWith('image/') && (
                <img
                  src={selectedContent.url}
                  alt={selectedContent.title}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '70vh', 
                    objectFit: 'contain',
                    borderRadius: 8
                  }}
                />
              )}
              
              {/* Video Content */}
              {selectedContent.type?.startsWith('video/') && (
                <video
                  src={selectedContent.url}
                  controls
                  autoPlay
                  style={{ 
                    width: '100%',
                    maxHeight: '70vh',
                    borderRadius: 8
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              )}
              
              {/* Audio Content */}
              {selectedContent.type?.startsWith('audio/') && (
                <Box sx={{ width: '100%', textAlign: 'center' }}>
                  <audio
                    src={selectedContent.url}
                    controls
                    autoPlay
                    style={{ width: '100%', maxWidth: '500px' }}
                  >
                    Your browser does not support the audio element.
                  </audio>
                </Box>
              )}
              
              {/* PDF Content */}
              {selectedContent.type === 'application/pdf' && (
                <iframe
                  src={`${selectedContent.url}#view=FitH`}
                  title={selectedContent.title}
                  style={{ 
                    width: '100%',
                    height: '70vh',
                    border: 'none',
                    borderRadius: 8
                  }}
                />
              )}
              
              {/* Document Content (Office files) */}
              {['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
              ].includes(selectedContent.type) && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" gutterBottom>
                    Office documents cannot be previewed directly.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    href={selectedContent.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ mt: 2 }}
                  >
                    Download Document
                  </Button>
                </Box>
              )}
              
              {/* Other File Types */}
              {!['image/', 'video/', 'audio/', 'application/pdf'].some(t => 
                t === 'application/pdf' ? selectedContent.type === t : selectedContent.type?.startsWith(t)
              ) && 
              !['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
              ].includes(selectedContent.type) && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" gutterBottom>
                    This file type cannot be previewed directly.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    href={selectedContent.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ mt: 2 }}
                  >
                    Download/Open File
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Modal>
    </Container>
  );
};

export default CourseDetails;
