// Email validation function
export const validateEmail = (email) => {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
};

// Password validation function (e.g., at least 8 characters)
export const validatePassword = (password) => {
  const minLength = 8;
  return password.length >= minLength;
};

// Name validation (non-empty string)
export const validateName = (name) => {
  return name.trim().length > 0;
};

// Mobile validation (only digits, 10 characters)
export const validateMobile = (mobile) => {
  const mobilePattern = /^[0-9]{10}$/;
  return mobilePattern.test(mobile);
};

// Address validation (non-empty string)
export const validateAddress = (address) => {
  return address.trim().length > 0;
};
