import { API_ENDPOINTS } from '@/config';
import { api } from './api/axiosConfig';

interface GenerateResultParams {
  educationYear: string;
  className: string;
  examName: string;
  studentId?: string;
}

// Named exports instead of default export
export const generateTabulationSheet = async ({ educationYear, className, examName }: GenerateResultParams): Promise<Blob> => {
  try {
    // Token will be automatically added by the axios interceptor

    // Log the request details for debugging
    console.log('Generating tabulation sheet with params:', {
      educationYear,
      className,
      examName,
      url: API_ENDPOINTS.RESULTS.TABULATION(educationYear, className, examName)
    });
    
    // Get the token from localStorage or sessionStorage
    const userData = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    const token = userData?.accessToken;
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const response = await api({
      method: 'GET',
      url: API_ENDPOINTS.RESULTS.TABULATION(educationYear, className, examName),
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf',
        'Authorization': `Bearer ${token}`
      },
      withCredentials: true,
      timeout: 30000 // 30 seconds timeout
    });
    
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error generating tabulation sheet:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data
      } : 'No response',
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    
    if (error.response) {
      console.error('Server responded with error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      if (error.response.status === 403) {
        throw new Error('You do not have permission to access this resource. Please ensure you are logged in with the correct role (ADMIN or TEACHER).');
      } else if (error.response.status === 401) {
        // Clear user data and redirect to login
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Your session has expired. Please log in again.');
      } else if (error.response.status === 404) {
        throw new Error('The requested resource was not found. Please check the parameters and try again.');
      }
    }
    
    throw new Error(error.message || 'Failed to generate tabulation sheet. Please try again later.');
  }
};

export const generateMeritList = async ({ educationYear, className, examName }: GenerateResultParams): Promise<Blob> => {
  try {
    console.log('Generating merit list with params:', {
      educationYear,
      className,
      examName,
      url: API_ENDPOINTS.RESULTS.MERIT(educationYear, className, examName)
    });
    
    // Get the token from localStorage or sessionStorage
    const userData = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    const token = userData?.accessToken;
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    const response = await api({
      method: 'GET',
      url: API_ENDPOINTS.RESULTS.MERIT(educationYear, className, examName),
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf',
        'Authorization': `Bearer ${token}`
      },
      withCredentials: true,
      timeout: 60000 // 60 seconds timeout
    });
    
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    // Check if the response is actually a PDF
    if (response.data.type !== 'application/pdf') {
      // If not a PDF, try to read the error message
      const errorText = await response.data.text();
      console.error('Unexpected response type:', response.data.type, 'Content:', errorText);
      
      // Handle empty merit list case
      if (errorText.includes('Merit list cannot be empty')) {
        throw new Error('No students found in the merit list for the selected criteria. Please check the exam and class selection.');
      }
      
      throw new Error(errorText || 'Unexpected response format from server');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error generating merit list:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data
      } : 'No response',
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      },
      stack: error.stack
    });
    
    if (error.response) {
      console.error('Server responded with error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      if (error.response.status === 403) {
        throw new Error('You do not have permission to access this resource. Please ensure you are logged in with the correct role (ADMIN or TEACHER).');
      } else if (error.response.status === 401) {
        // Clear user data and redirect to login
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Your session has expired. Please log in again.');
      } else if (error.response.status === 404) {
        throw new Error('The requested resource was not found. Please check the parameters and try again.');
      } else if (error.response.status === 500) {
        // Try to parse the error message from the response
        try {
          if (error.response.data instanceof Blob) {
            const errorText = await error.response.data.text();
            console.error('Server error response:', errorText);
            // Try to parse as JSON if possible
            try {
              const errorJson = JSON.parse(errorText);
              throw new Error(errorJson.message || errorJson.error || errorText || 'Internal server error');
            } catch (e) {
              throw new Error(errorText || 'Internal server error');
            }
          }
        } catch (e) {
          console.error('Error parsing error response:', e);
          throw new Error('An error occurred while processing the server response');
        }
      }
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please check your connection and try again.');
    } else if (error.message) {
      throw new Error(error.message);
    }
    
    throw new Error('Failed to generate merit list. Please try again later.');
  }
};

export const generateMarkSheet = async ({ educationYear, className, examName, studentId }: Required<GenerateResultParams>): Promise<Blob> => {
  try {
    // Token will be automatically added by the axios interceptor
    // Token will be automatically added by the axios interceptor
    
    const response = await api({
      method: 'GET',
      url: API_ENDPOINTS.RESULTS.MARKSHEET(educationYear, studentId, examName),
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      },
      withCredentials: true
    });
    
    return response.data;
  } catch (error) {
    console.error('Error generating mark sheet:', error);
    throw error;
  }
};

export const downloadPdf = (data: Blob, filename: string): void => {
  // Create a blob URL for the PDF
  const fileURL = URL.createObjectURL(data);
  
  // Create a temporary anchor element
  const link = document.createElement('a');
  
  // Set the href to the blob URL
  link.href = fileURL;
  
  // Set the download attribute with the filename and .pdf extension
  link.download = `${filename}.pdf`;
  
  // Append to body, click and remove
  document.body.appendChild(link);
  link.click();
  
  // Clean up by revoking the blob URL and removing the link
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(fileURL);
  }, 100);
};
