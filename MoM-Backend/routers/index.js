const express = require('express')
const app = express();
const UserRouter = require('./userRouter')

app.use('/user',UserRouter)


module.exports= app;