const successResponse = (req, res, data, message, statusCode = 200) => {
  console.log("message---------", message);
  return res.status(statusCode).send({
    error: false,
    success: true,
    message: message,
    data
  });
};

const failResponse = (req, res, data, message, statusCode = 400) => {
  return res.status(statusCode).send({
    error: true,  // Marked as error
    success: false,
    message: message,
    data
  });
};



const errorResponse = (req, res, errorDesc, errorKey = 500) => {
  console.log(">>>>>>>>>>>>>   ERROR\n", errorKey);
  
  // Check if errorDesc is an Error object
  const message = errorDesc instanceof Error ? errorDesc.message : errorDesc || 'An unknown error occurred';
  return res.status(errorKey).send({
    error: true,
    success: false,
    message: message,
    data: null
  });
};

module.exports = {
  errorResponse,
  failResponse,
  successResponse,
};