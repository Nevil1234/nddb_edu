import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { Notifications, Send, History } from '@mui/icons-material';
import axios from 'axios';
// import { initializeApp } from 'firebase/app';
// import { getMessaging, getToken } from 'firebase/messaging';

// // Your Firebase configuration
// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "your-app.firebaseapp.com",
//   projectId: "your-app-id",
//   storageBucket: "your-app.appspot.com",
//   messagingSenderId: "YOUR_SENDER_ID",
//   appId: "YOUR_APP_ID"
// };

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const messaging = getMessaging(app);

function SendAnnouncements() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recentNotifications, setRecentNotifications] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [coursesRes, usersRes, notificationsRes] = await Promise.all([
          axios.get('https://nddb-lms.onrender.com/api/courses'),
          axios.get('https://nddb-lms.onrender.com/api/users'),
          axios.get('https://nddb-lms.onrender.com/api/notifications')
        ]);
        
        setCourses(coursesRes.data);
        setUsers(usersRes.data);
        setRecentNotifications(notificationsRes.data);
      } catch (err) {
        setError('Failed to load data. Please refresh the page.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSendNotification = async () => {
    // Validation
    if (!title.trim()) {
      setError('Please enter a notification title');
      return;
    }
    
    if (!message.trim()) {
      setError('Please enter a notification message');
      return;
    }
    
    if (targetAudience === 'course' && selectedCourses.length === 0) {
      setError('Please select at least one course');
      return;
    }
    
    if (targetAudience === 'user' && selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }
    
    setSending(true);
    setError('');
    setSuccess('');
    
    try {
      // Prepare notification data
      const notificationData = {
        title,
        message,
        targetType: targetAudience,
        targetIds: targetAudience === 'course' 
          ? selectedCourses 
          : targetAudience === 'user' 
            ? selectedUsers 
            : []
      };
      
      // Send notification via your backend (which will use Firebase Admin SDK)
      const response = await axios.post(
        'https://nddb-lms.onrender.com/api/notifications/send', 
        notificationData
      );
      
      // Update UI with the new notification
      setRecentNotifications([response.data, ...recentNotifications]);
      
      // Reset form
      setTitle('');
      setMessage('');
      setTargetAudience('all');
      setSelectedCourses([]);
      setSelectedUsers([]);
      
      setSuccess('Notification sent successfully!');
    } catch (err) {
      setError('Failed to send notification. Please try again.');
      console.error('Error sending notification:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 600 }}>
        <Notifications sx={{ mr: 1, verticalAlign: 'middle' }} />
        Send Announcements
      </Typography>
      
      {/* Notification Form */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>Create New Announcement</Typography>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
        
        <TextField
          label="Notification Title"
          variant="outlined"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="Notification Message"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{ mb: 3 }}
        />
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Target Audience</InputLabel>
          <Select
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            label="Target Audience"
          >
            <MenuItem value="all">All Users</MenuItem>
            <MenuItem value="course">Specific Course(s)</MenuItem>
            <MenuItem value="user">Specific User(s)</MenuItem>
          </Select>
        </FormControl>
        
        {targetAudience === 'course' && (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Select Courses</InputLabel>
            <Select
              multiple
              value={selectedCourses}
              onChange={(e) => setSelectedCourses(e.target.value)}
              label="Select Courses"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((courseId) => {
                    const course = courses.find(c => c._id === courseId);
                    return (
                      <Chip 
                        key={courseId} 
                        label={course ? course.title : courseId} 
                      />
                    );
                  })}
                </Box>
              )}
            >
              {loading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mx: 'auto', my: 1 }} />
                </MenuItem>
              ) : (
                courses.map(course => (
                  <MenuItem key={course._id} value={course._id}>
                    {course.title}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        )}
        
        {targetAudience === 'user' && (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Select Users</InputLabel>
            <Select
              multiple
              value={selectedUsers}
              onChange={(e) => setSelectedUsers(e.target.value)}
              label="Select Users"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((userId) => {
                    const user = users.find(u => u._id === userId);
                    return (
                      <Chip 
                        key={userId} 
                        label={user ? user.name || user.email : userId} 
                      />
                    );
                  })}
                </Box>
              )}
            >
              {loading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mx: 'auto', my: 1 }} />
                </MenuItem>
              ) : (
                users.map(user => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name || user.email}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        )}
        
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={sending ? <CircularProgress size={20} color="inherit" /> : <Send />}
          onClick={handleSendNotification}
          disabled={sending}
          sx={{ mt: 2 }}
        >
          {sending ? 'Sending...' : 'Send Notification'}
        </Button>
      </Paper>
      
      {/* Recent Notifications */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          <History sx={{ mr: 1, verticalAlign: 'middle' }} />
          Recent Announcements
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : recentNotifications.length > 0 ? (
          recentNotifications.map(notification => (
            <Card key={notification._id} sx={{ mb: 2, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6">{notification.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Sent: {new Date(notification.createdAt).toLocaleString()}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body1">{notification.message}</Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip 
                    label={
                      notification.targetType === 'all' 
                        ? 'All Users' 
                        : notification.targetType === 'course'
                          ? `${notification.targetIds.length} Course(s)` 
                          : `${notification.targetIds.length} User(s)`
                    }
                    size="small"
                    color="primary"
                  />
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Alert severity="info">No recent announcements found.</Alert>
        )}
      </Box>
    </Container>
  );
}

export default SendAnnouncements;