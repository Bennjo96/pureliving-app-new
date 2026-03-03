// src/api/api.js
import axios from "axios";
import { jwtDecode } from "jwt-decode"; 

// Create an Axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Flag to track if a token refresh is in progress
let isRefreshing = false;
// Store of waiting requests
let waitingRequests = [];

// Helper to check if token is expired (or will expire soon)
export const isTokenExpired = (token, bufferSeconds = 60) => {
  if (!token) return true;
  
  try {
    const decoded = jwtDecode(token);
    // Current time in seconds + buffer
    const currentTime = Math.floor(Date.now() / 1000) + bufferSeconds;
    
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

// Helper to get token from storage (checking both localStorage and sessionStorage)
export const getAuthToken = (isAdmin = false) => {
  const tokenKey = isAdmin ? "adminAuthToken" : "authToken";
  return localStorage.getItem(tokenKey) || sessionStorage.getItem(tokenKey);
};

// Helper to store token (maintaining the same storage location)
export const storeAuthToken = (token, isAdmin = false) => {
  const tokenKey = isAdmin ? "adminAuthToken" : "authToken";
  // Check if token was previously in localStorage
  const wasInLocalStorage = !!localStorage.getItem(tokenKey);
  
  if (wasInLocalStorage) {
    localStorage.setItem(tokenKey, token);
  } else {
    sessionStorage.setItem(tokenKey, token);
  }
};

// Helper to remove tokens from all storage locations
export const clearAuthTokens = () => {
  // Clear regular tokens
  localStorage.removeItem("authToken");
  sessionStorage.removeItem("authToken");
  
  // Clear admin tokens
  localStorage.removeItem("adminAuthToken");
  sessionStorage.removeItem("adminAuthToken");
  
  // Clear role information
  localStorage.removeItem("userRole");
  sessionStorage.removeItem("userRole");
  // Don't remove activeRole here as it's needed for the redirect
};

// Set token in API headers
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Process all waiting requests after token refresh
const processWaitingRequests = (newToken) => {
  waitingRequests.forEach(callback => callback(newToken));
  waitingRequests = [];
};

// Interceptors for adding auth token and global error handling
api.interceptors.request.use(
  (config) => {
    // Prioritize admin token, fallback to regular token
    const adminToken = getAuthToken(true);
    const regularToken = getAuthToken(false);
    const token = adminToken || regularToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      console.error("Network Error:", error);
      return Promise.reject({ message: "Network error. Please check your connection." });
    }

    const originalRequest = error.config;
    const status = error.response.status;

    // Handle token expiration (401 error)
    if (status === 401 && !originalRequest._retry) {
      // Determine which token type we're dealing with
      const adminToken = getAuthToken(true);
      const regularToken = getAuthToken(false);
      const isAdmin = !!adminToken;

      // Only attempt to refresh if we have a token
      if (adminToken || regularToken) {
        originalRequest._retry = true;

        // If already refreshing, add to waiting queue
        if (isRefreshing) {
          return new Promise(resolve => {
            waitingRequests.push(token => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              resolve(api(originalRequest));
            });
          });
        }

        // Start refreshing
        isRefreshing = true;

        try {
          // Attempt to refresh the token
          const refreshResponse = isAdmin
            ? await authService.refreshAdminToken()
            : await authService.refreshToken();

          if (refreshResponse.data && refreshResponse.data.token) {
            const newToken = refreshResponse.data.token;
            
            // Store the new token
            storeAuthToken(newToken, isAdmin);
            
            // Update axios default headers
            setAuthToken(newToken);
            
            // Process waiting requests
            processWaitingRequests(newToken);
            
            // Retry the original request
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return api(originalRequest);
          } else {
            // If refresh failed, redirect to login
            handleUnauthorized();
            return Promise.reject(error.response.data);
          }
        } catch (refreshError) {
          // If refresh request failed, redirect to login
          console.error("Token refresh failed:", refreshError);
          handleUnauthorized();
          return Promise.reject(error.response.data);
        } finally {
          isRefreshing = false;
        }
      } else {
        // No token to refresh, redirect to login
        handleUnauthorized();
      }
    }

    // Handle other errors as before
    const errorHandlers = {
      403: () => console.error("Permission denied:", error.response.data),
      404: () => console.error("Resource not found:", error.response.data),
      422: () => console.error("Validation error:", error.response.data),
      500: () => console.error("Server error:", error.response.data),
      default: () => console.error("API Error:", error.response.data)
    };

    (errorHandlers[error.response.status] || errorHandlers.default)();
    return Promise.reject(error.response.data);
  }
);

// Function to handle unauthorized access (401)
const handleUnauthorized = () => {
  // Store activeRole before clearing tokens
  const activeRole = localStorage.getItem('activeRole');
  
  // Clear all tokens on unauthorized access
  clearAuthTokens();
  
  // Determine appropriate redirect based on role, with URL as fallback
  let path = "/login"; // Default path
  
  if (activeRole === 'admin') {
    path = "/admin/login";
  } else if (window.location.pathname.startsWith('/admin') && !activeRole) {
    // Fallback to URL check only if no activeRole is found
    path = "/admin/login";
  }
  
  // Redirect to appropriate login page
  window.location.href = path;
};

// Authentication Services
export const authService = {
  // Regular User Authentication
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => {
    const response = api.post("/auth/logout");
    clearAuthTokens(); // Clear tokens regardless of response
    localStorage.removeItem("activeRole"); // Clear activeRole on explicit logout
    return response;
  },
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  
  // Token refresh endpoints
  refreshToken: () => api.post("/auth/refresh-token"),
  refreshAdminToken: () => api.post("/auth/admin/refresh-token"),
  
  // Admin-Specific Authentication
  adminLogin: (credentials) => api.post("/auth/admin/login", credentials),
  adminLogout: () => {
    const response = api.post("/auth/admin/logout");
    clearAuthTokens(); // Clear tokens regardless of response
    localStorage.removeItem("activeRole"); // Clear activeRole on explicit logout
    return response;
  },
  adminRegister: (userData) => api.post("/auth/admin/register", userData),
  verifyAdminCode: (code) => api.post("/auth/verify-admin-code", { code }),
  
  // Admin Invitation Validation
  validateAdminInvitation: (token) => api.get(`/admin/invitations/validate/${token}`),
};

// User Services
export const userService = {
  getProfile: () => api.get("/users/profile"),
  getAdminProfile: () => api.get("/admin/profile"), // Added for admin profile
  updateProfile: (data) => api.put("/users/profile", data),
  changePassword: (passwords) => api.put("/users/change-password", passwords),
  deleteAccount: () => api.delete("/users/delete-account"),
  getSettings: () => api.get("/users/settings"),
  updateSettings: (settings) => api.put("/users/settings", settings),
  getSavedAddresses: () => api.get("/users/addresses"),
  addAddress: (address) => api.post("/users/addresses", address),
  updateAddress: (addressId, address) => api.put(`/users/addresses/${addressId}`, address),
  deleteAddress: (addressId) => api.delete(`/users/addresses/${addressId}`),
};

// Admin Services
export const adminService = {
  // Dashboard and User Management
  getDashboard: () => api.get("/admin/dashboard"),
  getUsers: () => api.get("/admin/users"),
  createUser: (userData) => api.post("/admin/users", userData),
  updateUser: (userId, data) => api.put(`/admin/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),

  // Booking Management
  getBookings: () => api.get("/admin/bookings"),
  updateBookingStatus: (bookingId, status) => api.put(`/admin/bookings/${bookingId}`, { status }),
  assignCleaner: (bookingId, cleanerId) => api.post(`/admin/bookings/assign-cleaner`, { bookingId, cleanerId }),
  getAvailableCleaners: () => api.get("/admin/cleaners/available"),

  // Analytics and Payments
  getAnalytics: (timeframe) => api.get(`/admin/analytics?timeframe=${timeframe}`),
  exportAnalytics: (params) => api.get("/admin/analytics/export", { params, responseType: 'blob' }),
  getPaymentAnalytics: (filters) => api.get("/admin/payments", { params: filters }),

  // Notification Management
  getNotifications: () => api.get("/admin/notifications"),
  markNotificationAsRead: (notificationId) => api.patch(`/admin/notifications/${notificationId}/read`),
  clearAllNotifications: () => api.delete("/admin/notifications"),
  getUnreadNotificationsCount: () => api.get("/admin/notifications/unread/count"),

  // System Settings
  getSystemSettings: () => api.get("/admin/system-settings"),
  updateSystemSettings: (settings) => api.put("/admin/system-settings", settings),
  
  // Cleaner Management
  getCleaners: () => api.get("/admin/cleaners"),
  getCleaner: (cleanerId) => api.get(`/admin/cleaners/${cleanerId}`),
  addCleaner: (cleanerData) => api.post("/admin/cleaners", cleanerData),
  updateCleaner: (cleanerId, cleanerData) => api.put(`/admin/cleaners/${cleanerId}`, cleanerData),
  deleteCleaner: (cleanerId) => api.delete(`/admin/cleaners/${cleanerId}`),
  updateCleanerStatus: (cleanerId, status) => api.put(`/admin/cleaners/${cleanerId}/status`, { status }),
  
  // Admin Invitation Management
  getAdminInvitations: () => api.get("/admin/invitations"),
  createAdminInvitation: (inviteData) => api.post("/admin/invitations", inviteData),
  deleteAdminInvitation: (invitationId) => api.delete(`/admin/invitations/${invitationId}`),
  resendAdminInvitation: (invitationId) => api.post(`/admin/invitations/${invitationId}/resend`),
  getInvitationStats: () => api.get("/admin/invitations/stats"),
};

// Booking Services
export const bookingService = {
  // Create and manage bookings
  getBookingTypes: () => api.get("/bookings/types"),
  getAvailableTimeSlots: (date, serviceType) => api.get("/bookings/available-slots", { params: { date, serviceType } }),
  getAvailableCleaners: (date, timeSlot, serviceType, location) => api.get("/bookings/available-cleaners", { 
    params: { date, timeSlot, serviceType, location } 
  }),
  createBooking: (bookingData) => api.post("/bookings", bookingData),
  getBookingById: (bookingId) => api.get(`/bookings/${bookingId}`),
  updateBooking: (bookingId, bookingData) => api.put(`/bookings/${bookingId}`, bookingData),
  cancelBooking: (bookingId) => api.put(`/bookings/${bookingId}/cancel`),
  
  // Customer bookings
  getMyBookings: () => api.get("/bookings/user"),
  rateBooking: (bookingId, rating, review) => api.post(`/bookings/${bookingId}/review`, { rating, review }),

  // Payment processing
  processPayment: (bookingId, paymentDetails) => api.post(`/bookings/${bookingId}/process-payment`, paymentDetails),
  
  // Location and availability
  checkServiceAvailability: (postalCode) => api.get(`/bookings/availability/${postalCode}`),
  getPostalCodeFromCoordinates: (latitude, longitude) => api.get(`/geo/reverse-geocode`, {
    params: { latitude, longitude }
  }),
  getLocationFromCoordinates: (latitude, longitude) => api.get(`/geo/location-from-coordinates`, {
    params: { latitude, longitude }
  }),
  validateLocation: (locationName) => api.get(`/geo/validate-location/${encodeURIComponent(locationName)}`),
  searchLocations: (query) => api.get(`/geo/search-locations/${encodeURIComponent(query)}`)
};

// Cleaner Services
export const cleanerService = {
  // Dashboard and jobs
  getDashboard: () => api.get("/cleaner/dashboard"),
  getJobs: (params) => {
    // Create a new params object with correct structure
    const queryParams = {};
    
    // Handle case where params is an object containing date ranges
    if (params) {
      if (params.startDate || params.dateFrom) queryParams.dateFrom = params.startDate || params.dateFrom;
      if (params.endDate || params.dateTo) queryParams.dateTo = params.endDate || params.dateTo;
      if (params.status && typeof params.status === 'string') queryParams.status = params.status;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
    }
    
    return api.get("/cleaner/jobs", { params: queryParams });
  },
  getJobDetails: (jobId) => api.get(`/cleaner/jobs/${jobId}`),
  updateJobStatus: (jobId, status, notes) => api.put(`/cleaner/jobs/${jobId}/status`, { status, notes }),
  
  // Availability management
  getAvailability: () => api.get("/cleaner/availability"),
  updateAvailability: (availabilityData) => api.put("/cleaner/availability", availabilityData),
  requestTimeOff: (timeOffData) => api.post("/cleaner/time-off", timeOffData),
  cancelTimeOff: (timeOffId) => api.delete(`/cleaner/time-off/${timeOffId}`),
  
  // Cleaner profile
  getProfile: () => api.get("/cleaner/profile"),
  updateProfile: (profileData) => api.put("/cleaner/profile", profileData),
  updateServices: (services) => api.put("/cleaner/services", { services }),
  updateServiceAreas: (areas) => api.put("/cleaner/service-areas", { areas }),
  
  // Earnings
  getEarnings: (period) => api.get("/cleaner/earnings", { params: { period } }),
  getEarningsDetails: (period) => api.get("/cleaner/earnings/details", { params: { period } }),
  
  // Reviews
  getReviews: () => api.get("/cleaner/reviews"),
  getReviewStats: () => api.get("/cleaner/reviews/stats"),
  respondToReview: (reviewId, response) => api.post(`/cleaner/reviews/${reviewId}/respond`, { response }),
};

// Notification Services
export const notificationService = {
  // User notifications
  getNotifications: () => api.get("/notifications"),
  markAsRead: (notificationId) => api.patch(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.patch("/notifications/read-all"),
  getUnreadCount: () => api.get("/notifications/unread/count"),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  
  // Notification preferences
  getPreferences: () => api.get("/notifications/preferences"),
  updatePreferences: (preferences) => api.put("/notifications/preferences", preferences),
};

// Payment Services
export const paymentService = {
  // Payment methods
  getPaymentMethods: () => api.get("/payments/methods"),
  addPaymentMethod: (paymentMethodData) => api.post("/payments/methods", paymentMethodData),
  updatePaymentMethod: (paymentMethodId, paymentMethodData) => api.put(`/payments/methods/${paymentMethodId}`, paymentMethodData),
  deletePaymentMethod: (paymentMethodId) => api.delete(`/payments/methods/${paymentMethodId}`),
  setDefaultPaymentMethod: (paymentMethodId) => api.put(`/payments/methods/${paymentMethodId}/default`),
  
  // Payment history
  getPaymentHistory: () => api.get("/payments/history"),
  getPaymentDetails: (paymentId) => api.get(`/payments/${paymentId}`),
  
  // Invoices
  getInvoices: () => api.get("/payments/invoices"),
  getInvoice: (invoiceId) => api.get(`/payments/invoices/${invoiceId}`),
  downloadInvoice: (invoiceId) => api.get(`/payments/invoices/${invoiceId}/download`, { responseType: 'blob' }),
};

// Messaging Services
export const messageService = {
  // Conversations
  getConversations: () => api.get("/messages/conversations"),
  getConversation: (conversationId) => api.get(`/messages/conversations/${conversationId}`),
  createConversation: (recipientId, message, subject) => api.post("/messages/conversations", { recipientId, message, subject }),
  
  // Messages
  getMessages: (conversationId) => api.get(`/messages/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, message) => api.post(`/messages/conversations/${conversationId}`, { message }),
  getNewMessages: (conversationId, after) => api.get(`/messages/conversations/${conversationId}/messages`, { params: { after } }),
  markConversationAsRead: (conversationId) => api.patch(`/messages/conversations/${conversationId}/read`),
  
  // Recipients
  getAvailableRecipients: () => api.get("/messages/recipients"),
};

// Settings Services
export const settingsService = {
  // Theme and language
  getSettings: () => api.get("/settings"),
  updateSettings: (settings) => api.put("/settings", settings),
  
  // Application settings
  getAppSettings: () => api.get("/settings/app"),
  
  // For both customer and cleaner profiles
  getProfileSettings: () => api.get("/settings/profile"),
  updateProfileSettings: (settings) => api.put("/settings/profile", settings),
  
  // For cleaner-specific settings
  getWorkSettings: () => api.get("/settings/work"),
  updateWorkSettings: (settings) => api.put("/settings/work", settings),
};

// Error Handling Utility
export const handleApiError = (error) => {
  if (error.response) {
    return {
      error: true,
      message: error.response.data.message || "An error occurred",
      status: error.response.status,
      data: error.response.data,
    };
  }
  
  return {
    error: true,
    message: error.message || "Network error",
    status: error.request ? 503 : 400,
  };
};

export default api;