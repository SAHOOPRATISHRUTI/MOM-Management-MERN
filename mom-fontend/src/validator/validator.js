// email validation function
export const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };
  
  // password validation function (e.g., at least 8 characters)
  export const validatePassword = (password) => {
    const minLength = 8;
    return password.length >= minLength;
  };
  