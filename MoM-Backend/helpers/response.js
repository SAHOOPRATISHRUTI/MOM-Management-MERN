const successResponse = (req, res, data, message, statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message: message,
      data: data,
    });
  };
  
  const failResponse = (req, res, errors, message, statusCode = 400) => {
    return res.status(statusCode).json({
      success: false,
      message: message,
      errors: errors,
    });
  };
  
  const errorResponse = (req, res, error, statusCode = 500) => {
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  };
  
  module.exports = {
    successResponse,
    failResponse,
    errorResponse,
  };
  