import axios, { AxiosError } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  timestamp?: string;
  error?: string;
}

// 🔐 Helper: Safely retrieve stored JWT token
const getAuthToken = (): string | null => {
  try {
    console.log('🔍 Checking for user data in storage...');
    
    // First try to get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && parsedUser.accessToken) {
          console.log('🔑 Found access token in user data');
          return parsedUser.accessToken;
        }
      } catch (e) {
        console.error('❌ Error parsing user data:', e);
      }
    }
    
    console.log('🔍 No valid token found in storage');
    return null;
  } catch (error) {
    console.error("❌ Error accessing storage:", error);
    return null;
  }
};

// 📊 Enhanced Dashboard Statistics Fetcher
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const token = getAuthToken();
    const url = `${API_BASE_URL}/api/dashboard/stats`;
    console.log('🌐 Making request to:', url);
    const defaultError = "Failed to fetch dashboard data";

    console.log("📡 [fetchDashboardStats] Preparing request to:", url);
    console.log("🔑 Token exists:", !!token);
    
    if (!token) {
      console.warn("⚠️ No authentication token found in storage");
      return { 
        totalStudents: 0, 
        totalTeachers: 0, 
        error: "Authentication required" 
      };
    }

    const response = await axios.get<DashboardStats>(url, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      timeout: 10000 // 10 second timeout
    });

    console.log("✅ Dashboard stats received at", new Date().toISOString());
    console.debug("📊 Response data:", response.data);

    // Validate response structure
    if (typeof response.data.totalStudents === 'number' && 
        typeof response.data.totalTeachers === 'number') {
      return response.data;
    } else {
      console.error("❌ Invalid response structure:", response.data);
      throw new Error("Invalid response format from server");
    }

  }  catch (error) {
  const defaultError = "Failed to fetch dashboard statistics";
  
  // Type guard to check if it's an AxiosError
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string }>; // Properly type the error
    
    if (axiosError.response) {
      // The request was made and the server responded with a status code
      console.error("❌ Server responded with error:", {
        status: axiosError.response.status,
        data: axiosError.response.data
      });
    } else if (axiosError.request) {
      // No response received
      console.error("❌ No response from server - check network connection");
    } else {
      // Request setup error
      console.error("❌ Request setup error:", axiosError.message);
    }

    return {
      totalStudents: 0,
      totalTeachers: 0,
      error: axiosError.response?.data?.error || defaultError,
      timestamp: new Date().toISOString()
    };
  }

  // For non-Axios errors
  console.error("❌ An unexpected error occurred:", error);
  return {
    totalStudents: 0,
    totalTeachers: 0,
    error: defaultError,
    timestamp: new Date().toISOString()
  };
}
};