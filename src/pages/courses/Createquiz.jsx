import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Container, Typography, TextField, Button, Paper, 
  CircularProgress, Alert, Divider, IconButton, FormControl,
  FormControlLabel, Radio, RadioGroup, FormLabel, Chip, Modal,
  Grid, Card, CardContent, CardMedia, CardActions, useTheme,
  Stepper, Step, StepLabel, InputAdornment, Tooltip,
  Slide, Fade, Zoom
} from '@mui/material';
import {
  Assignment, ArrowBack, Add, Delete, Save, CheckCircle,
  Image, Videocam, Info, Edit, Clear, UploadFile, Help,
  QuestionAnswer
} from '@mui/icons-material';

const CreateQuiz = () => {
  const { courseId, quizId } = useParams(); // Get quizId from URL if editing
  const navigate = useNavigate();
  const theme = useTheme();
  const fileInputRef = useRef(null);
  
  // State to track if we're editing an existing quiz
  const [isEditMode, setIsEditMode] = useState(false);
  
  // State for quiz
  const [quizDetails, setQuizDetails] = useState({
    title: '',
    description: ''
  });
  const [quizCreated, setQuizCreated] = useState(false);
  const [quizIdState, setQuizIdState] = useState(null);
  
  // State for questions
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    type: 'multiple-choice',
    media: null
  });
  const [questions, setQuestions] = useState([]);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null);
  
  // Check if we're in edit mode and fetch quiz data
  useEffect(() => {
    const checkEditMode = async () => {
      // If quizId is in URL, we're in edit mode
      if (quizId) {
        try {
          setLoading(true);
          setIsEditMode(true);
          
          // Fetch quiz details
          const quizResponse = await axios.get(`https://nddb-lms.onrender.com/api/join/quizzes/${quizId}`);
          const quizData = quizResponse.data.data;
          
          // Set quiz details
          setQuizDetails({
            title: quizData.title,
            description: quizData.description
          });
          
          // Set quiz as created and store ID
          setQuizCreated(true);
          setQuizIdState(quizId);
          
          // Fetch and set questions
          if (quizData.questions && quizData.questions.length > 0) {
            const formattedQuestions = quizData.questions.map(q => {
              // Handle options which might be stored as string
              let options = q.options;
              if (typeof options === 'string') {
                try {
                  options = JSON.parse(options);
                } catch (e) {
                  options = [];
                  console.error('Error parsing options:', e);
                }
              }
              
              return {
                ...q,
                options: options
              };
            });
            
            setQuestions(formattedQuestions);
          }
          
          setLoading(false);
        } catch (err) {
          console.error('Error fetching quiz for editing:', err);
          setError('Failed to load quiz for editing.');
          setLoading(false);
        }
      }
    };
    
    checkEditMode();
  }, [quizId]);
  
  // Handle creating or updating a quiz
  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!quizDetails.title || !quizDetails.description) {
      setError('Please provide both title and description for the quiz.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      let response;
      
      if (isEditMode) {
        // Update existing quiz
        response = await axios.put(`https://nddb-lms.onrender.com/api/quizzes/${quizIdState}`, {
          title: quizDetails.title,
          description: quizDetails.description
        });
      } else {
        // Create new quiz
        response = await axios.post('https://nddb-lms.onrender.com/api/quizzes', {
          courseId: courseId,
          title: quizDetails.title,
          description: quizDetails.description
        });
        
        setQuizIdState(response.data.data._id);
      }
      
      setQuizCreated(true);
      setSuccess(isEditMode ? 'Quiz updated successfully!' : 'Quiz created successfully! Now you can add questions.');
      setLoading(false);
    } catch (err) {
      setError(isEditMode ? 'Failed to update quiz.' : 'Failed to create quiz. Please try again.');
      setLoading(false);
      console.error('Error with quiz:', err);
    }
  };
  
  // Handle adding or updating a question
  const handleSaveQuestion = async () => {
    // Validate question
    if (
      !currentQuestion.questionText || 
      currentQuestion.options.some(opt => !opt) || 
      !currentQuestion.correctAnswer
    ) {
      setError('Please complete all fields: question text, all options, and select a correct answer.');
      return;
    }
    
    // Validate correct answer is in options
    if (!currentQuestion.options.includes(currentQuestion.correctAnswer)) {
      setError('The correct answer must be one of the provided options.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Format the question payload according to the API requirements
      let questionToSave = {
        questionText: currentQuestion.questionText,
        options: JSON.stringify(currentQuestion.options),
        correctAnswer: currentQuestion.correctAnswer,
        type: 'multiple-choice', // Set default type
        quizId: quizIdState,
        media: currentQuestion.media
      };
      
      console.log('Saving question with payload:', questionToSave);
      
      // If editing existing question
      if (editingQuestionIndex !== null) {
        // If the question already has an ID (exists in database)
        if (questions[editingQuestionIndex]._id) {
          const updateResponse = await axios.put(
            `https://nddb-lms.onrender.com/api/questions/${questions[editingQuestionIndex]._id}`,
            questionToSave
          );
          console.log('Update response:', updateResponse.data);
          
          // Update the question with the response data
          const updatedQuestion = updateResponse.data.data || questionToSave;
          
          // Update questions array
          const updatedQuestions = [...questions];
          updatedQuestions[editingQuestionIndex] = updatedQuestion;
          setQuestions(updatedQuestions);
        } else {
          // If the question doesn't have an ID yet, create it
          const response = await axios.post(
            'https://nddb-lms.onrender.com/api/questions',
            questionToSave
          );
          console.log('Create response:', response.data);
          
          // Update the question with the response data
          const createdQuestion = response.data.data || questionToSave;
          
          // Update questions array
          const updatedQuestions = [...questions];
          updatedQuestions[editingQuestionIndex] = createdQuestion;
          setQuestions(updatedQuestions);
        }
        
        setEditingQuestionIndex(null);
      } else {
        // Create new question
        const response = await axios.post(
          'https://nddb-lms.onrender.com/api/questions',
          questionToSave
        );
        console.log('Create response:', response.data);
        
        // Add to questions array with the response data
        const createdQuestion = response.data.data || questionToSave;
        setQuestions([...questions, createdQuestion]);
      }
      
      // Reset current question
      setCurrentQuestion({
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        type: 'multiple-choice',
        media: null
      });
      setMediaPreview(null);
      
      setSuccess('Question saved successfully!');
      setLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving question:', err);
      
      // Extract more detailed error message if available
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to save question. Please try again.';
      
      setError(errorMessage);
      setLoading(false);
    }
  };
  
  // Handle editing a question
  const handleEditQuestion = (index) => {
    setEditingQuestionIndex(index);
    
    // If the options are stored as a string, parse them back to an array
    const questionToEdit = {...questions[index]};
    
    if (typeof questionToEdit.options === 'string') {
      try {
        questionToEdit.options = JSON.parse(questionToEdit.options);
      } catch (e) {
        console.error('Error parsing options string:', e);
        questionToEdit.options = ['', '', '', '']; // Fallback
      }
    }
    
    // Map the questionText to text if needed
    const editedQuestion = {
      questionText: questionToEdit.questionText || questionToEdit.text || '',
      options: questionToEdit.options || ['', '', '', ''],
      correctAnswer: questionToEdit.correctAnswer || '',
      type: questionToEdit.type || 'multiple-choice',
      media: questionToEdit.media
    };
    
    setCurrentQuestion(editedQuestion);
    
    // If there's media, set the preview
    if (questionToEdit.media) {
      setMediaPreview(questionToEdit.media.url);
    } else {
      setMediaPreview(null);
    }
  };
  
  // Handle file upload for question media
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type and size
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    const validTypes = [...validImageTypes, ...validVideoTypes];
    
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG, GIF) or video (MP4, WebM, OGG) file.');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB.');
      return;
    }
    
    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);
    
    // In a real app, upload the file to server and get a URL
    // For now, we'll just simulate having the media URL
    setCurrentQuestion({
      ...currentQuestion,
      media: {
        type: file.type,
        url: previewUrl // In a real app, this would be the URL from the server
      }
    });
  };
  
  // Handle removing media
  const handleRemoveMedia = () => {
    setMediaPreview(null);
    setCurrentQuestion({
      ...currentQuestion,
      media: null
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle final quiz submission
  const handleSubmitQuiz = async () => {
    if (questions.length === 0) {
      setError('Please add at least one question before submitting the quiz.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, you might have a final API call to mark the quiz as complete
      // await axios.put(`https://nddb-lms.onrender.com/api/quizzes/${quizIdState}/complete`, { status: 'completed' });
      
      setSuccess(isEditMode ? 'Quiz updated successfully!' : 'Quiz submitted successfully!');
      setConfirmModalOpen(false);
      setLoading(false);
      
      // Redirect to course details page after successful submission
      setTimeout(() => {
        navigate(`/courses/${courseId}`);
      }, 1500);
    } catch (err) {
      setError(isEditMode ? 'Failed to update quiz.' : 'Failed to submit quiz. Please try again.');
      setLoading(false);
      setConfirmModalOpen(false);
      console.error('Error submitting quiz:', err);
    }
  };
  
  // Helper function to update option at specific index
  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions
    });
  };
  
  // Return to course details
  const handleGoBack = () => {
    navigate(`/courses/${courseId}`);
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Box sx={{ mb: 3 }}>
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
          Back to Course Details
        </Button>
        
        <Fade in={true} timeout={600}>
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 700, 
            mb: 1,
            background: 'linear-gradient(90deg, #1a237e, #42a5f5)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}>
            {isEditMode 
              ? `Edit Quiz: ${quizDetails.title}` 
              : (quizCreated ? `Create Questions for: ${quizDetails.title}` : 'Create New Quiz')}
          </Typography>
        </Fade>
        
        <Typography variant="body1" color="text.secondary" sx={{ 
          mb: 4,
          fontSize: '1.05rem',
          maxWidth: '800px'
        }}>
          {quizCreated 
            ? 'Add questions, options, and specify the correct answer for your quiz.' 
            : 'Start by giving your quiz a title and a brief description.'}
        </Typography>
      </Box>
      
      {error && (
        <Zoom in={true}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)',
              '& .MuiAlert-icon': { alignItems: 'center' }
            }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        </Zoom>
      )}
      
      {success && (
        <Zoom in={true}>
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
              '& .MuiAlert-icon': { alignItems: 'center' }
            }} 
            onClose={() => setSuccess(null)}
          >
            {success}
          </Alert>
        </Zoom>
      )}
      
      {!quizCreated ? (
        <Zoom in={true} timeout={500}>
          <Paper elevation={3} sx={{ 
            p: { xs: 3, md: 4 }, 
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(230,230,230,0.9)'
          }}>
            <Typography variant="h6" sx={{ 
              mb: 3, 
              fontWeight: 600,
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Assignment fontSize="small" />
              {isEditMode ? 'Edit Quiz Details' : 'Quiz Details'}
            </Typography>
            
            <form onSubmit={handleCreateQuiz}>
              <TextField
                label="Quiz Title"
                variant="outlined"
                fullWidth
                required
                value={quizDetails.title}
                onChange={(e) => setQuizDetails({...quizDetails, title: e.target.value})}
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  }
                }}
              />
              
              <TextField
                label="Quiz Description (brief)"
                variant="outlined"
                fullWidth
                required
                value={quizDetails.description}
                onChange={(e) => setQuizDetails({...quizDetails, description: e.target.value})}
                multiline
                rows={2}
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  }
                }}
                inputProps={{ maxLength: 100 }}
                helperText={`${quizDetails.description.length}/100 characters`}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Assignment />}
                  sx={{
                    background: 'linear-gradient(45deg, #1a237e, #42a5f5)',
                    px: 3,
                    py: 1.2,
                    borderRadius: 2,
                    boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: '0 6px 15px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  {isEditMode ? 'Update Quiz' : 'Create Quiz'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Zoom>
      ) : (
        <>
          <Box sx={{ mb: 4 }}>
            <Zoom in={true} timeout={500}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: 'linear-gradient(135deg, #1a237e, #283593)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  boxShadow: '0 8px 20px rgba(26, 35, 126, 0.3)',
                }}
              >
                <Assignment fontSize="large" />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {quizDetails.title}
                  </Typography>
                  <Typography variant="body2">
                    {quizDetails.description}
                  </Typography>
                </Box>
                <Chip 
                  label={`${questions.length} Questions`} 
                  sx={{ 
                    ml: 'auto', 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    borderRadius: '10px',
                    fontWeight: 600
                  }}
                />
              </Paper>
            </Zoom>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Fade in={true} timeout={700}>
                <Paper elevation={3} sx={{ 
                  p: { xs: 3, md: 4 }, 
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(230,230,230,0.9)'
                }}>
                  <Typography variant="h6" sx={{ 
                    mb: 3, 
                    fontWeight: 600, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    color: 'primary.main'
                  }}>
                    <QuestionAnswer fontSize="small" />
                    {editingQuestionIndex !== null ? 'Edit Question' : 'Add New Question'}
                  </Typography>
                  
                  <TextField
                    label="Question Text"
                    variant="outlined"
                    fullWidth
                    required
                    value={currentQuestion.questionText}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, questionText: e.target.value})}
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                      }
                    }}
                  />
                  
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      pb: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}>
                      <Typography variant="subtitle2" sx={{ 
                        mr: 2,
                        fontWeight: 600,
                        color: 'text.primary'
                      }}>
                        Question Media (Optional)
                      </Typography>
                      <Tooltip title="You can add an image or video to your question">
                        <Info fontSize="small" color="primary" />
                      </Tooltip>
                    </Box
                    >
                    
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Button
                        variant="outlined"
                        startIcon={<UploadFile />}
                        onClick={() => fileInputRef.current.click()}
                        sx={{ 
                          borderRadius: 2,
                          px: 2,
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: 'rgba(25, 118, 210, 0.08)',
                          }
                        }}
                      >
                        Upload Media
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                        accept="image/jpeg,image/png,image/gif,video/mp4,video/webm,video/ogg"
                      />
                      
                      {mediaPreview && (
                        <Chip 
                          label="Remove Media" 
                          onDelete={handleRemoveMedia}
                          deleteIcon={<Clear />}
                          color="default"
                          sx={{ 
                            borderRadius: 2,
                            bgcolor: 'rgba(0,0,0,0.05)',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: 'rgba(0,0,0,0.1)',
                            }
                          }}
                        />
                      )}
                    </Box>
                    
                    {mediaPreview && (
                      <Zoom in={true} timeout={300}>
                        <Box sx={{ 
                          mt: 2, 
                          p: 1, 
                          border: '1px solid #eee', 
                          borderRadius: 2, 
                          maxWidth: 300,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          overflow: 'hidden'
                        }}>
                          {currentQuestion.media?.type?.startsWith('image/') ? (
                            <img 
                              src={mediaPreview} 
                              alt="Preview" 
                              style={{ 
                                width: '100%', 
                                borderRadius: 8,
                                display: 'block'
                              }}
                            />
                          ) : currentQuestion.media?.type?.startsWith('video/') ? (
                            <video 
                              src={mediaPreview} 
                              controls
                              style={{ 
                                width: '100%', 
                                borderRadius: 8,
                                display: 'block'
                              }}
                            >
                              Your browser does not support video playback.
                            </video>
                          ) : null}
                        </Box>
                      </Zoom>
                    )}
                  </Box>
                  
                  <Typography variant="subtitle2" sx={{ 
                    mb: 2,
                    fontWeight: 600,
                    color: 'text.primary',
                    pb: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}>
                    Answer Options
                  </Typography>
                  
                  {currentQuestion.options.map((option, index) => (
                    <Fade in={true} key={index} timeout={300 + index * 100}>
                      <Box sx={{ 
                        mb: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1 
                      }}>
                        <TextField
                          label={`Option ${index + 1}`}
                          variant="outlined"
                          fullWidth
                          required
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Radio
                                  checked={currentQuestion.correctAnswer === option && option !== ''}
                                  onChange={() => setCurrentQuestion({...currentQuestion, correctAnswer: option})}
                                  disabled={option === ''}
                                  sx={{
                                    '&.Mui-checked': {
                                      color: 'success.main',
                                    }
                                  }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: currentQuestion.correctAnswer === option && option !== '' 
                                  ? 'success.main' 
                                  : 'primary.main',
                              },
                              ...(currentQuestion.correctAnswer === option && option !== '' && {
                                '& fieldset': {
                                  borderColor: 'success.main',
                                  borderWidth: 2,
                                },
                              }),
                            }
                          }}
                        />
                      </Box>
                    </Fade>
                  ))}
                  
                  <Box sx={{ 
                    color: 'text.secondary', 
                    mb: 3, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    bgcolor: 'rgba(0,0,0,0.02)',
                    p: 2,
                    borderRadius: 2
                  }}>
                    <Help fontSize="small" color="primary" />
                    <Typography variant="body2">
                      Select the radio button next to the correct answer.
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => {
                        setCurrentQuestion({
                          questionText: '',
                          options: ['', '', '', ''],
                          correctAnswer: '',
                          type: 'multiple-choice',
                          media: null
                        });
                        setMediaPreview(null);
                        setEditingQuestionIndex(null);
                      }}
                      sx={{ 
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: 'rgba(156, 39, 176, 0.08)',
                        }
                      }}
                    >
                      Clear
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSaveQuestion}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : (editingQuestionIndex !== null ? <Save /> : <Add />)}
                      sx={{
                        background: 'linear-gradient(45deg, #1a237e, #42a5f5)',
                        borderRadius: 2,
                        px: 3,
                        py: 1.2,
                        boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: '0 6px 15px rgba(25, 118, 210, 0.4)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
                    </Button>
                  </Box>
                </Paper>
              </Fade>
              
              {questions.length > 0 && (
                <Fade in={true} timeout={900}>
                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      color="success"
                      size="large"
                      onClick={() => setConfirmModalOpen(true)}
                      startIcon={<CheckCircle />}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        background: 'linear-gradient(45deg, #2e7d32, #4caf50)',
                        boxShadow: '0 4px 10px rgba(46, 125, 50, 0.3)',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: '0 6px 15px rgba(46, 125, 50, 0.4)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      Submit Quiz
                    </Button>
                  </Box>
                </Fade>
              )}
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Slide in={true} direction="left" timeout={500}>
                <Paper elevation={2} sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  bgcolor: '#f9f9f9',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(230,230,230,0.9)',
                  height: '100%'
                }}>
                  <Typography variant="h6" sx={{ 
                    mb: 3, 
                    fontWeight: 600, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    color: '#1a237e'
                  }}>
                    <Assignment fontSize="small" />
                    Quiz Questions ({questions.length})
                  </Typography>
                  
                  {questions.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                      No questions added yet. Create your first question!
                    </Typography>
                  ) : (
                    <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
                      {questions.map((question, index) => (
                        <Card 
                          key={index} 
                          sx={{ 
                            mb: 2, 
                            borderRadius: 2,
                            position: 'relative',
                            overflow: 'visible',
                          }}
                        >
                          <Box
                            sx={{
                              position: 'absolute',
                              top: -10,
                              left: -10,
                              width: 30,
                              height: 30,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              boxShadow: 1,
                            }}
                          >
                            {index + 1}
                          </Box>
                          
                          <CardContent sx={{ pt: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                              {question.questionText || question.text}
                            </Typography>
                            
                            {question.media && (
                              <Box sx={{ mb: 1, maxHeight: 100, overflow: 'hidden' }}>
                                {question.media.type?.startsWith('image/') ? (
                                  <img 
                                    src={question.media.url} 
                                    alt="Question media"
                                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'cover', borderRadius: 4 }}
                                  />
                                ) : question.media.type?.startsWith('video/') ? (
                                  <Box sx={{ bgcolor: '#000', borderRadius: 1, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Videocam sx={{ color: '#fff' }} />
                                    <Typography variant="caption" sx={{ color: '#fff', ml: 1 }}>Video</Typography>
                                  </Box>
                                ) : null}
                              </Box>
                            )}
                            
                            <Box sx={{ mt: 1 }}>
                              {typeof question.options === 'string' 
                                ? JSON.parse(question.options).map((option, optIndex) => (
                                  <Typography 
                                    key={optIndex} 
                                    variant="body2" 
                                    sx={{ 
                                      mb: 0.5, 
                                      color: option === question.correctAnswer ? 'success.main' : 'text.primary',
                                      fontWeight: option === question.correctAnswer ? 500 : 400,
                                    }}
                                  >
                                    {optIndex + 1}. {option}
                                    {option === question.correctAnswer && ' ✓'}
                                  </Typography>
                                ))
                                : question.options?.map((option, optIndex) => (
                                  <Typography 
                                    key={optIndex} 
                                    variant="body2" 
                                    sx={{ 
                                      mb: 0.5, 
                                      color: option === question.correctAnswer ? 'success.main' : 'text.primary',
                                      fontWeight: option === question.correctAnswer ? 500 : 400,
                                    }}
                                  >
                                    {optIndex + 1}. {option}
                                    {option === question.correctAnswer && ' ✓'}
                                  </Typography>
                                ))}
                            </Box>
                          </CardContent>
                          
                          <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleEditQuestion(index)}
                              sx={{ mr: 0.5 }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => {
                                const newQuestions = [...questions];
                                newQuestions.splice(index, 1);
                                setQuestions(newQuestions);
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </CardActions>
                        </Card>
                      ))}
                    </Box>
                  )}
                </Paper>
              </Slide>
            </Grid>
          </Grid>
        </>
      )}
      
      {/* Confirmation Modal - enhanced styling */}
      <Modal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        aria-labelledby="confirm-modal-title"
      >
        <Zoom in={confirmModalOpen}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: '0 16px 32px rgba(0,0,0,0.15)',
            p: 4,
            border: '1px solid rgba(230,230,230,0.9)',
          }}>
            <Typography id="confirm-modal-title" variant="h6" component="h2" sx={{ 
              mb: 2,
              fontWeight: 600,
              color: 'primary.main'
            }}>
              {isEditMode ? 'Update Quiz' : 'Submit Quiz'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Are you sure you want to {isEditMode ? 'update' : 'submit'} this quiz with {questions.length} questions? 
              {!isEditMode && ' This action cannot be undone.'}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => setConfirmModalOpen(false)}
                sx={{ borderRadius: 2 }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleSubmitQuiz}
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
                sx={{
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #1a237e, #42a5f5)',
                  boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
                }}
              >
                {isEditMode ? 'Update' : 'Submit'}
              </Button>
            </Box>
          </Box>
        </Zoom>
      </Modal>
    </Container>
  );
};

export default CreateQuiz;
