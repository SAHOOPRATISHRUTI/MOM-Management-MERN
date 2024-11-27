const express = require('express');
const router = express.Router();
const oathController = require('../controller/oauthConrller')



router.get('/google',oathController.googleLogin)
router.post('/google-signup',oathController.googleSignUp)

module.exports=router;