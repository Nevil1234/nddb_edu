import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import {
  Box, Typography, TextField, IconButton, Avatar, Paper,
  CircularProgress, Chip, Divider, Alert
} from '@mui/material';
import {
  Send, AdminPanelSettings
} from '@mui/icons-material';
// Import the auth context
let AuthContext;
try {
  AuthContext = require('../contexts/AuthContext').AuthContext;
} catch (error) {
  console.error("AuthContext not found, using mock context");
  AuthContext = React.createContext({
    currentUser: { id: 'mock-user', role: 'admin', name: 'Mock User' },
    isAuthenticated: true
  });
}

const DiscussionForum = ({ courseId }) => {
  console.log("DiscussionForum rendering, courseId:", courseId);
  
  // Use context with fallback
  const auth = useContext(AuthContext) || { 
    currentUser: { id: 'mock-user', role: 'admin', name: 'Mock User' },
    isAuthenticated: true
  };
  
  const { currentUser, isAuthenticated } = auth;
  console.log("Auth state:", { isAuthenticated, currentUser });
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState(null);
  const pollingIntervalRef = useRef(null);
  
  // Fetch messages on component mount and when courseId changes
  useEffect(() => {
    fetchMessages();
    
    // Set up polling for new messages
    pollingIntervalRef.current = setInterval(() => {
      fetchNewMessages();
    }, 5000); // Poll every 5 seconds
    
    // Clean up interval on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [courseId]);

  // Update lastMessageTimestamp when messages change
  useEffect(() => {
    if (messages.length > 0) {
      // Find the most recent message timestamp
      const timestamps = messages
        .map(msg => new Date(msg.timestamp).getTime())
        .filter(timestamp => !isNaN(timestamp));
      
      if (timestamps.length > 0) {
        const latestTimestamp = Math.max(...timestamps);
        setLastMessageTimestamp(new Date(latestTimestamp).toISOString());
      }
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages from API
  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`https://nddb-lms.onrender.com/api/courseChats?courseId=${courseId}`);
      
      if (response.data && response.data.data) {
        setMessages(response.data.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching chat messages:', err);
      setError('Failed to load chat messages. Please try again.');
      setLoading(false);
    }
  };

  // Fetch only new messages that arrived after the last fetched message
  const fetchNewMessages = async () => {
    if (!courseId || loading) return;
    
    try {
      // Only include timestamp filter if we have a last message timestamp
      const timestampFilter = lastMessageTimestamp 
        ? `&timestamp_gt=${encodeURIComponent(lastMessageTimestamp)}` 
        : '';
      
      const response = await axios.get(
        `https://nddb-lms.onrender.com/api/courseChats?courseId=${courseId}${timestampFilter}`
      );
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        // Merge new messages with existing ones, avoiding duplicates
        setMessages(prevMessages => {
          const existingIds = new Set(prevMessages.map(msg => msg._id));
          const newMessages = response.data.data.filter(msg => !existingIds.has(msg._id));
          
          if (newMessages.length === 0) return prevMessages;
          
          // Play notification sound if there are new messages
          playNotificationSound();
          
          return [...prevMessages, ...newMessages];
        });
      }
    } catch (err) {
      console.error('Error fetching new messages:', err);
      // Don't set error state here to avoid disrupting the UI during polling
    }
  };
  
  // Function to play notification sound for new messages
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3'); // You'll need to add this file to your public folder
      audio.volume = 0.5;
      audio.play();
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !isAuthenticated) return;
    
    try {
      const messageData = {
        courseId: courseId,
        senderId: currentUser.id,
        senderRole: currentUser.role,
        message: newMessage,
        timestamp: new Date().toISOString()
      };
      
      // Show optimistic update
      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        ...messageData,
        senderName: currentUser.name || currentUser.username || 'User', // Use available name field
        pending: true
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage('');
      
      // Send to API
      const response = await axios.post('https://nddb-lms.onrender.com/api/courseChats', messageData);
      
      // Replace optimistic message with real one from server
      if (response.data && response.data.data) {
        setMessages(prev => prev.map(msg => 
          msg._id === optimisticMessage._id ? response.data.data : msg
        ));
      }
      
      // After sending the message, immediately fetch new messages
      // This ensures we get the latest messages including our own
      setTimeout(() => fetchNewMessages(), 500);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      
      // Remove failed message
      setMessages(prev => prev.filter(msg => msg._id !== `temp-${Date.now()}`));
    }
  };

  // Format time for messages
  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Determine if a message is from an admin
  const isAdminMessage = (senderRole) => {
    return senderRole === 'admin';
  };

  // If user is not authenticated, show a message
  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          You need to be logged in to participate in the discussion.
        </Alert>
        
        <Box 
          sx={{ 
            height: '60vh', 
            overflowY: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 2,
            boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1)'
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress size={40} />
            </Box>
          ) : messages.length > 0 ? (
            messages.map((message) => (
              <Box 
                key={message._id}
                sx={{
                  display: 'flex',
                  justifyContent: isAdminMessage(message.senderRole) ? 'flex-end' : 'flex-start',
                  width: '100%',
                }}
              >
                {!isAdminMessage(message.senderRole) && (
                  <Avatar 
                    sx={{ 
                      bgcolor: message.senderRole === 'admin' ? 'primary.main' : 'secondary.main',
                      mr: 1,
                      mt: 1
                    }}
                  >
                    {message.senderName ? message.senderName.charAt(0) : 'U'}
                  </Avatar>
                )}
                
                <Box
                  sx={{
                    maxWidth: '70%',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: isAdminMessage(message.senderRole) ? 'primary.main' : 'grey.100',
                    color: isAdminMessage(message.senderRole) ? 'white' : 'text.primary',
                    opacity: message.pending ? 0.7 : 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                    {message.senderRole === 'admin' ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {message.senderName || 'Admin'}
                        </Typography>
                        <AdminPanelSettings 
                          fontSize="small" 
                          color="inherit" 
                          sx={{ ml: 0.5, opacity: 0.7 }} 
                        />
                      </Box>
                    ) : (
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {message.senderName || `User ${message.senderId.substring(0, 5)}`}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="body1">{message.message}</Typography>
                  <Typography 
                    variant="caption" 
                    color={isAdminMessage(message.senderRole) ? 'rgba(255,255,255,0.7)' : 'text.secondary'}
                    sx={{ display: 'block', textAlign: 'right', mt: 1 }}
                  >
                    {formatMessageTime(message.timestamp)}
                    {message.pending && ' (Sending...)'}
                  </Typography>
                </Box>
                
                {isAdminMessage(message.senderRole) && (
                  <Avatar 
                    sx={{ 
                      bgcolor: 'primary.main',
                      ml: 1,
                      mt: 1
                    }}
                  >
                    A
                  </Avatar>
                )}
              </Box>
            ))
          ) : (
            <Typography color="text.secondary">No messages in this discussion yet.</Typography>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '70vh' }}>
      {/* Forum Header */}
      <Paper elevation={1} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 2 }}>
        <Typography variant="h6" component="h2">
          Course Discussion
        </Typography>
        {/* <Chip 
          label={`${messages.length} messages`} 
          color="primary" 
          size="small" 
        /> */}
      </Paper>

      {/* Messages Container */}
      <Box 
        sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          mb: 2, 
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {loading && messages.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress size={40} />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', color: 'error.main', py: 2 }}>
            <Typography>{error}</Typography>
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 10 }}>
            <Typography>No messages yet. Start the conversation!</Typography>
          </Box>
        ) : (
          messages.map((message) => (
            <Box 
              key={message._id}
              sx={{
                display: 'flex',
                justifyContent: isAdminMessage(message.senderRole) ? 'flex-end' : 'flex-start',
                width: '100%',
              }}
            >
              {!isAdminMessage(message.senderRole) && (
                <Avatar 
                  sx={{ 
                    bgcolor: message.senderRole === 'admin' ? 'primary.main' : 'secondary.main',
                    mr: 1,
                    mt: 1
                  }}
                >
                  {message.senderName ? message.senderName.charAt(0) : 'U'}
                </Avatar>
              )}
              
              <Box
                sx={{
                  maxWidth: '70%',
                  p: 2,
                  borderRadius: 2,
                  bgcolor: isAdminMessage(message.senderRole) ? 'primary.main' : 'grey.100',
                  color: isAdminMessage(message.senderRole) ? 'white' : 'text.primary',
                  opacity: message.pending ? 0.7 : 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                  {message.senderRole === 'admin' ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {message.senderName || 'Admin'}
                      </Typography>
                      <AdminPanelSettings 
                        fontSize="small" 
                        color="inherit" 
                        sx={{ ml: 0.5, opacity: 0.7 }} 
                      />
                    </Box>
                  ) : (
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {message.senderName || `User ${message.senderId.substring(0, 5)}`}
                    </Typography>
                  )}
                </Box>
                <Typography variant="body1">{message.message}</Typography>
                <Typography 
                  variant="caption" 
                  color={isAdminMessage(message.senderRole) ? 'rgba(255,255,255,0.7)' : 'text.secondary'}
                  sx={{ display: 'block', textAlign: 'right', mt: 1 }}
                >
                  {formatMessageTime(message.timestamp)}
                  {message.pending && ' (Sending...)'}
                </Typography>
              </Box>
              
              {isAdminMessage(message.senderRole) && (
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.main',
                    ml: 1,
                    mt: 1
                  }}
                >
                  A
                </Avatar>
              )}
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>
      
      {/* Message Input */}
      <Paper
        component="form"
        elevation={2}
        sx={{ 
          p: 1, 
          display: 'flex', 
          alignItems: 'center',
          borderRadius: 3
        }}
        onSubmit={handleSendMessage}
      >
        <TextField
          fullWidth
          placeholder="Type your message here..."
          variant="standard"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          InputProps={{
            disableUnderline: true,
            sx: { px: 2, py: 1 }
          }}
        />
        <IconButton 
          color="primary" 
          type="submit"
          disabled={!newMessage.trim()}
          sx={{ 
            p: 1, 
            bgcolor: 'primary.main', 
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
            '&.Mui-disabled': {
              bgcolor: 'action.disabledBackground',
              color: 'action.disabled',
            }
          }}
        >
          <Send />
        </IconButton>
      </Paper>
    </Box>
  );
};

export default DiscussionForum;
