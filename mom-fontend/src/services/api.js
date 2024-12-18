import axios from 'axios';

const API_URL = 'http://localhost:5000/api/user'; 

// Login User
const loginUser = async (email, password) => {
  try {
    console.log("Sending login request with:", email, password); 
    const response = await axios.post(`${API_URL}/login`, { email, password });
    localStorage.setItem('authToken', response.data.token);
    console.log(response.data.token);
    return response.data;
  } catch (error) {
    // Log the error message
    if (error.response) {
      console.error('Server Error:', error.response.data.message);
      throw new Error(error.response.data.message || 'Login failed');
    } else if (error.request) {
      console.error('No response from server:', error.request);
      throw new Error('No response from server');
    } else {
      console.error('Error during request:', error.message);
      throw new Error('An error occurred during the login request');
    }
  }
};

// Generate OTP for login
const generateOTP = async (email) => {
  try {
    console.log("Sending OTP generation request for:", email);
    const response = await axios.post(`${API_URL}/generate-otp`, { email });
    return response.data;  
  } catch (error) {
    // Log the error message
    if (error.response) {
      console.error('Server Error:', error.response.data.message);
      throw new Error(error.response.data.message || 'Failed to generate OTP');
    } else if (error.request) {
      console.error('No response from server:', error.request);
      throw new Error('No response from server');
    } else {
      console.error('Error during request:', error.message);
      throw new Error('An error occurred during OTP generation');
    }
  }
};

const verifyOTP = async (email, otp) => {
  try {
    console.log('Sending OTP verification request for:', email, otp);
    const response = await axios.post(`${API_URL}/verify-otp`, { email, otp });

    // Log the full response for debugging
    console.log('Full response from server:', response.data);

    // Access the token correctly
    const token = response.data.data?.token;
    if (!token) {
      throw new Error('Token is missing from server response');
    }
    const employeeName= response.data.data?.employeeName;

    // Store the token in localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('employeeName', employeeName);
    console.log('Token stored in localStorage:', token);

    console.log('OTP verification response:', response.data);

    // Return the response data
    return response.data;
  } catch (error) {
    // Improved error handling
    if (error.response) {
      console.error('Server Error:', error.response.data.message);
      throw new Error(error.response.data.message || 'OTP verification failed');
    } else if (error.request) {
      console.error('No response from server:', error.request);
      throw new Error('No response from server');
    } else {
      console.error('Error during request:', error.message);
      throw new Error('An error occurred during OTP verification');
    }
  }
};


// Forgot Password
const resetPassword = async (email, otp, password, confirmPassword) => {
  try {
    console.log("Sending forgot password request for:", email);
    const response = await axios.post(`${API_URL}/forgot-password`, { email, otp, password, confirmPassword });
    return response.data;
    
  } catch (error) {
    if (error.response) {
      console.error('Server Error:', error.response.data.message);
      throw new Error(error.response.data.message || 'Failed to send forgot password request');
    } else if (error.request) {
      console.error('No response from server:', error.request);
      throw new Error('No response from server');
    } else {
      console.error('Error during request:', error.message);
      throw new Error('An error occurred during forgot password request');
    }
  }
};

// Send OTP for signup
const sendOtp = async (email) => {
  try {
    console.log("Sending OTP request for:", email);
    const response = await axios.post(`${API_URL}/send-otp`, { email });
    return response.data;
  } catch (error) {
    // Log the error message
    if (error.response) {
      console.error('Server Error:', error.response.data.message);
      throw new Error(error.response.data.message || 'Failed to send OTP');
    } else if (error.request) {
      console.error('No response from server:', error.request);
      throw new Error('No response from server');
    } else {
      console.error('Error during request:', error.message);
      throw new Error('An error occurred during OTP sending');
    }
  }
};

// Verify OTP gor sign up
const verifyOtpforSignUp = async (email, otp) => {
  try {
    console.log('Sending OTP verification request for login:', email, otp);
    const response = await axios.post(`${API_URL}/verifyotp`, { email, otp });
    return response.data;
  } catch (error) {
    // Log the error message
    if (error.response) {
      console.error('Server Error:', error.response.data.message);
      throw new Error(error.response.data.message || 'OTP verification failed');
    } else if (error.request) {
      console.error('No response from server:', error.request);
      throw new Error('No response from server');
    } else {
      console.error('Error during request:', error.message);
      throw new Error('An error occurred during OTP verification');
    }
  }
};


const signupUser = async (formData) => {
  try {
    console.log("Sending signup request with FormData:", formData);

    const response = await axios.post(`${API_URL}/signup`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Server Error:", error.response.data.message);
      throw new Error(error.response.data.message || "Signup failed");
    } else if (error.request) {
      console.error("No response from server:", error.request);
      throw new Error("No response from server");
    } else {
      console.error("Error during request:", error.message);
      throw new Error("An error occurred during signup request");
    }
  }
};


const logoutUser = async () => {
  try {
    console.log("Sending logout request");

    // Make the API request to logout
    const response = await axios.post(`${API_URL}/logout`, null, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}` // Send token in the header
      }
    });

    // Clear the token from localStorage or sessionStorage
    localStorage.removeItem('authToken'); // Removing token on logout

    return response.data;  // Return the server response message

  } catch (error) {
    // Log the error message
    if (error.response) {
      console.error('Server Error:', error.response.data.message);
      throw new Error(error.response.data.message || 'Logout failed');
    } else if (error.request) {
      console.error('No response from server:', error.request);
      throw new Error('No response from server');
    } else {
      console.error('Error during request:', error.message);
      throw new Error('An error occurred during the logout request');
    }
  }
};

// Add Employee
const addEmployee = async (employeeName, employeeId, email, designation, department, unit) => {
  try {
    console.log("Sending request to add employee with details:", employeeName, employeeId, email, designation, department, unit);
    
    // Create an employee object to send in the request body
    const employeeData = {
      employeeName,
      employeeId,
      email,
      designation,
      department,
      unit
    };

    // Sending POST request to the API with employee data
    const response = await axios.post(`${API_URL}/employee`, employeeData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`, // Include token for authenticated requests
      },
    });

    // Log and return the server response
    console.log("Employee added successfully:", response.data);
    return response.data;
  } catch (error) {
    // Improved error handling
    if (error.response) {
      console.error('Server Error:', error.response.data.message);
      throw new Error(error.response.data.message || 'Failed to add employee');
    } else if (error.request) {
      console.error('No response from server:', error.request);
      throw new Error('No response from server');
    } else {
      console.error('Error during request:', error.message);
      throw new Error('An error occurred while adding the employee');
    }
  }
};

const listEmployee = async (page = 1, limit = 5, order = '-1', searchKey = '') => {
  try {
    //console.log("Sending request to list employees with filters:", "page:", page, "limit:", limit, "order:", order, "searchKey:", searchKey);

    const includeDeactivated = 'true'; 

    const params = {
      page,
      limit,
      order,
      searchKey,
    };

    //console.log('Requesting employees with params:', params);

    const response = await axios.get(`${API_URL}/employees`, {
      params,
      headers: { 
        Authorization: `Bearer ${localStorage.getItem('authToken')}` 
      }
    });

    //console.log('Employees fetched successfully:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw new Error('Error fetching employees');
  }
};



const activateEmployee = async(employeeId)=>{
  try{
    console.log("Sensding requst to activateEmployeeID",employeeId);
    const response = await axios.post(`${API_URL}/activate/${employeeId}`,
      {},
      {
        headers:{
          Authorization:`Bearer ${localStorage.getItem('authToken')}`
        },
      }
    );
    console.log('Employee added Sucessfully',response.data);
    return response.data;
    
  }catch(error){
    console.error(error)
  }
}

const deactiveEmployee = async(employeeId)=>{
  try{
    console.log('Sendding request to deactive employee id',employeeId);
    const response = await axios.post(`${API_URL}/deactivate/${employeeId}`,
      {},
    {
      headers:{
        Authorization:`Bearer ${localStorage.getItem('authToken')}`
      }
    })
    console.log('Employee Deactivate Sucssfully',response.data);
    return response.data;
    

  }catch(error){
    console.error(error)
  }
}




const api = axios.create({
    baseURL: "http://localhost:5000/api/user",
    // withCredentials: true,
});

const googleAuth = (code) => api.get(`/google?code=${code}`);

export const googleSignUp = (code) => api.post(`/google-signup?code=${code}`);




const updateEmployeeProfile = async (id, updatedData, profilePicture) => {
  try {
    console.log("Sending request to update profile for user:", id);
    const formData = new FormData();

    for (const key in updatedData) {
      if (updatedData[key]) {
        formData.append(key, updatedData[key]);
      }
    }

    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    const response = await axios.put(`${API_URL}/profile/${id}`, formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log("Profile updated successfully:", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Server Error:', error.response.data.message);
      throw new Error(error.response.data.message || 'Failed to update profile');
    } else if (error.request) {
      console.error('No response from server:', error.request);
      throw new Error('No response from server');
    } else {
      console.error('Error during request:', error.message);
      throw new Error('An error occurred while updating the profile');
    }
  }
};


    
const getEmployeeById = async (id) => {
  try {
      console.log("Fetching employee with ID:", id); // Log to check if ID is passed correctly
      
      if (!id) {
          throw new Error("Employee ID is required");
      }

      const response = await axios.get(`${API_URL}/employees/${id}`);
      
      // Log the successful response to check if the API returns the expected data
      console.log("Employee details fetched successfully:", response.data);
      
      return response.data;
  } catch (error) {
      // Handle different types of errors based on the error structure
      if (error.response) {
          console.error("Server Error:", error.response.data.message);
          throw new Error(error.response.data.message || 'Failed to fetch employee details');
      } else if (error.request) {
          console.error("No response from server:", error.request);
          throw new Error('No response from server');
      } else {
          console.error("Request Error:", error.message);
          throw new Error('An error occurred during the request');
      }
  }
};

const getEmployeeStatus = async (id) => {
  try {
      console.log("Fetching employee status with ID:", id); // Log for debugging

      if (!id) {
          throw new Error("Employee ID is required");
      }
      const response = await axios.get(`${API_URL}/idstatus/${id}`);
      
      console.log("Employee status fetched successfully:", response.data);
      return response.data;
  } catch (error) {
      if (error.response) {
          console.error("Server Error:", error.response.data);
          throw new Error(error.response.data.message || 'Failed to fetch employee status');
      } else if (error.request) {
          console.error("No response from server:", error.request);
          throw new Error('No response from server');
      } else {
          console.error("Request Error:", error.message);
          throw new Error('An error occurred during the request');
      }
  }
};

const importfromcsv = async(file) =>{
  try{
    console.log("CSV file started");

    const formData = new FormData()
    formData.append("file",file)

    if(!file){
      console.log("File Not found");
      
    }
    const response =await axios.post(`${API_URL}/upload-csv`,formData,{
      headers: {
        "Content-Type": "multipart/form-data",
      }
    })
    return response.data;

    console.log("CSV import sucessfully",response.data);
  }
    catch (error) {
      if (error.response) {
        console.error("Server Error:", error.response.data);
        throw new Error(error.response.data.message || "Failed to import CSV file");
      } else if (error.request) {
        console.error("No response from server:", error.request);
        throw new Error("No response from server");
      } else {
        console.error("Request Error:", error.message);
        throw new Error("An error occurred during the CSV import request");
      }
    }

  
}

const downloadFile = async (fileId) => {
  try {
    console.log("Sending download request for file with ID:", fileId);
    const response = await axios.get(`${API_URL}/download/${fileId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`, // Include token for authenticated requests
      },
      responseType: 'blob',  // This is required for downloading files
    });

    // Create a URL for the file
    const fileURL = URL.createObjectURL(new Blob([response.data]));

    // Create an invisible link element to trigger the download
    const link = document.createElement('a');
    link.href = fileURL;
    link.download = 'file_name';  // You can dynamically set the filename here if needed
    document.body.appendChild(link);
    link.click();

    // Clean up the URL object
    URL.revokeObjectURL(fileURL);

    console.log("File downloaded successfully.");
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Server Error:', error.response.data.message);
      throw new Error(error.response.data.message || 'Failed to download file');
    } else if (error.request) {
      console.error('No response from server:', error.request);
      throw new Error('No response from server');
    } else {
      console.error('Error during request:', error.message);
      throw new Error('An error occurred during the download request');
    }
  }
};




export { 
  importfromcsv,
         loginUser,
         downloadFile,
         generateOTP,
         verifyOTP, 
         signupUser, 
         sendOtp, 
         verifyOtpforSignUp,
         resetPassword,
         logoutUser,
         addEmployee,
         listEmployee,
        activateEmployee,
        deactiveEmployee,
        googleAuth,
        updateEmployeeProfile,
        getEmployeeById,
        getEmployeeStatus
      };
