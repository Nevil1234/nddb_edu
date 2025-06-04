// authService.js
const API_URL = import.meta.env.VITE_API_BASE_URL || "https://nddb-lms.onrender.com";

export const authService = {  async login(email, password) {
    try {
      console.log('AuthService: Attempting login to', `${API_URL}/auth/login`);
      console.log('With credentials:', { email, password: '***hidden***' });
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log('AuthService: Response received:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Do not store in localStorage here, let the AuthContext handle this
      return data;
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    }
  },

  async register(name, email, password) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: 'admin' 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Register error:', error.message);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }
};
