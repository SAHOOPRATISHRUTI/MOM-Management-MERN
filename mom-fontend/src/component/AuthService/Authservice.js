const AuthService = {
    isLoggedIn: () => {
      return !!localStorage.getItem('authToken');
    },
    login: (authToken, employeeName) => {
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('employeeName', employeeName); // Save employee name
    },
    logout: () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('employeeName'); // Clear employee name
    },
    getEmployeeName: () => {
      return localStorage.getItem('employeeName'); // Retrieve employee name
    },
  };
  
  export default AuthService;
  