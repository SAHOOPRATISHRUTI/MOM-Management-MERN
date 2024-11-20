const Joi = require('joi');

const createEmployee = async (req, res, next) => {
    try {
        const employeeSchema = Joi.object({
            employeeName: Joi.string()
                .pattern(/^[a-zA-Z\s]+$/)
                .min(2)
                .max(20)
                .trim()
                .messages({
                    "string.pattern.base": "Employee Name can only contain letters and spaces"
                }),
            employeeId: Joi.string()
                .pattern(/^[a-zA-Z0-9\-\/]+$/)
                .min(1)
                .max(20),
            email: Joi.string()
                .pattern(/^[a-zA-Z0-9.@]+$/)
                .email()
                .min(3)
                .max(30),
            designation: Joi.string()
                .pattern(/^[a-zA-Z\s]+$/)
                .min(2)
                .max(20)
                .trim(),
            department: Joi.string()
                .pattern(/^[a-zA-Z\s]+$/)
                .min(2)
                .max(20)
                .trim(),
            unit: Joi.string()
                .pattern(/^[a-zA-Z\s]+$/)
                .min(2)
                .max(20)
        });

        await employeeSchema.validateAsync(req.body);
        next();
    } catch (error) {
        console.error('Validation Error creating employee:', error.details);
        res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: error.details
        });
    }
};

// const requestOtpValidator = async (req, res, next) => {
//     try {
//         const otpSchema = Joi.object({
//             email: Joi.string()
//                 .email()
//                 .min(3)
//                 .max(30)
//                 .required()
//         });

//         await otpSchema.validateAsync(req.body);
//         next();
//     } catch (error) {
//         console.error('Validation Error requesting OTP:', error.details);
//         res.status(400).json({
//             success: false,
//             message: 'Validation error',
//             errors: error.details
//         });
//     }
// };

// const verifyOtpValidator = async (req, res, next) => {
//     try {
//         const otpSchema = Joi.object({
//             email: Joi.string()
//                 .email()
//                 .min(3)
//                 .max(30)
//                 .required(),
//             otp: Joi.string()
//                 .pattern(/^[0-9]+$/)
//                 .required()
//         });

//         await otpSchema.validateAsync(req.body);
//         next();
//     } catch (error) {
//         console.error('Validation Error verifying OTP:', error.details);
//         res.status(400).json({
//             success: false,
//             message: 'Validation error',
//             errors: error.details
//         });
//     }
// };

module.exports = {
    createEmployee,
    
};