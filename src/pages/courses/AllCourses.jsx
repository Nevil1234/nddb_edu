import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Container, Typography, Grid, CardContent, 
  CardMedia, Button, CircularProgress,
  Chip, useTheme, useMediaQuery, Alert, Paper, Tooltip, Avatar
} from '@mui/material';
import {
  ArrowForward, School
} from '@mui/icons-material';

const AllCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // Fetch all courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://nddb-lms.onrender.com/api/courses');
        setCourses(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch courses. Please try again later.');
        setLoading(false);
        console.error('Error fetching courses:', err);
      }
    };
    
    fetchCourses();
  }, []);

  // Navigate to course details page
  const handleViewCourseDetails = (courseId) => {
    navigate(`/courses/${courseId}`);
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

  // Function to truncate description text
  const truncateDescription = (text, maxLength = 60) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (error) {
    return (
      <Box sx={{ py: 5, textAlign: 'center' }}>
        <Alert severity="error" sx={{ width: '100%', maxWidth: '600px', mx: 'auto' }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        mb: 4, 
        fontWeight: 700,
        letterSpacing: 0.5,
        background: 'linear-gradient(90deg, #1976d2 30%, #42a5f5 100%)',
        backgroundClip: 'text',
        textFillColor: 'transparent',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        All Courses
      </Typography>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {!loading && courses.length === 0 && (
        <Box sx={{ py: 5, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No courses available at the moment.
          </Typography>
        </Box>
      )}
      
      <Grid container spacing={4}>
        {courses.map((course) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={course._id}>
            <Paper 
              elevation={3}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                background: '#fff',
                boxShadow: '0 2px 12px 0 rgba(60,72,88,0.10)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.02)',
                  boxShadow: '0 8px 32px 0 rgba(33,150,243,0.13)',
                  cursor: 'pointer',
                },
              }}
              onClick={() => handleViewCourseDetails(course._id)}
            >
              <Box sx={{ position: 'relative', height: 190, bgcolor: '#e3eafc' }}>
                <CardMedia
                  component="img"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    transition: 'transform 0.3s cubic-bezier(.4,2,.6,1)',
                    '&:hover': {
                      transform: 'scale(1.04)',
                    }
                  }}
                  image={course.thumbnail ? `https://nddb-lms.onrender.com${course.thumbnail}` : 'https://via.placeholder.com/400x225?text=Course+Thumbnail'}
                  alt={course.title}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    zIndex: 2,
                  }}
                >
                  <Chip 
                    icon={<School fontSize="small" />}
                    label={course.status.charAt(0).toUpperCase() + course.status.slice(1)} 
                    size="small"
                    sx={{
                      borderRadius: 1,
                      height: '22px',
                      fontSize: '0.7rem',
                      bgcolor: course.status === 'active'
                        ? 'rgba(56, 183, 74, 0.92)'    // Green background for active
                        : 'rgba(220, 38, 38, 0.92)',   // Red background for inactive
                      color: course.status === 'active'
                        ? '#fff'                       // White text for active
                        : '#fff',                      // White text for inactive
                      fontWeight: 600,
                      boxShadow: 1,
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    bgcolor: 'rgba(0, 0, 0, 0.55)',
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    fontSize: '0.8rem',
                    letterSpacing: 0.2,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    {formatDate(course.createdAt)}
                  </Typography>
                </Box>
              </Box>

              <CardContent sx={{ 
                p: 2, 
                display: 'flex', 
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 2,
                minHeight: 80,
                bgcolor: '#fff',
              }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: '#1976d2',
                    fontWeight: 700,
                    fontSize: 18,
                    mt: 0.5,
                  }}
                  alt={course.title}
                  src={course.instructorAvatar || ''}
                >
                  {course.title ? course.title.charAt(0).toUpperCase() : ''}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Tooltip title={course.title} arrow>
                    <Typography 
                      variant="subtitle1" 
                      component="h2" 
                      sx={{ 
                        fontWeight: 700,
                        mb: 0.5, 
                        lineHeight: 1.2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: '#212121',
                        fontSize: '1rem'
                      }}
                    >
                      {course.title}
                    </Typography>
                  </Tooltip>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '0.93rem'
                    }}
                  >
                    {truncateDescription(course.description, 60)}
                  </Typography>
                  <Button 
                    variant="text"
                    endIcon={<ArrowForward fontSize="small" />}
                    size="small"
                    sx={{ 
                      mt: 0.5,
                      p: 0,
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      textTransform: 'none',
                      color: theme.palette.primary.main,
                      minHeight: 0,
                      minWidth: 0,
                      '&:hover': {
                        backgroundColor: 'transparent',
                        textDecoration: 'underline',
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewCourseDetails(course._id);
                    }}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AllCourses;
