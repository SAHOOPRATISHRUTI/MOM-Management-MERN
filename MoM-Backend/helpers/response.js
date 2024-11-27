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
  // Ensure statusCode is numeric and valid
  if (!Number.isInteger(statusCode) || statusCode < 100 || statusCode > 599) {
      statusCode = 400;  // default to 400 if an invalid status code is passed
  }

  return res.status(statusCode).send({
      error: true,
      success: false,
      message: message,
      data
  });
};


const errorResponse = (res, message, errorKey = 500) => {
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