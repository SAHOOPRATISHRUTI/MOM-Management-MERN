const successResponse = (req, res, data, message, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message: message,
    data: data,
  });
};

const failResponse = (req, res, error, message, statusCode = 400) => {
  // Check if error is an object with a message, otherwise fallback to string
  const errorMessage = error ? (typeof error === 'object' && error.message ? error.message : error) : 'No details provided';
  console.error(`Error: ${errorMessage}`); // Log the error message
  return res.status(statusCode).json({
    success: false,
    message: message,
    error: errorMessage,  // Ensure error details are shown
  });
};

const errorResponse = (req, res, error, statusCode = 500, errorMessage = '') => {
  const message = errorMessage || (error && error.message) || 'An unknown error occurred';
  
  if (process.env.NODE_ENV !== 'production') {
      console.error(error);  // Log the entire error in non-production environments
  }

  return res.status(statusCode).json({
      success: false,
      message: message,  
      data: null,  
      stack: process.env.NODE_ENV !== 'production' ? (error?.stack || '') : undefined,  // Include stack trace in non-production environments
  });
};

module.exports = {
  successResponse,
  failResponse,
  errorResponse,
};
