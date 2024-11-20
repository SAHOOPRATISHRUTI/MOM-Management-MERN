const express = require('express')
const app = express();
const UserRouter = require('./empRouter')


app.use('/user',UserRouter)



module.exports= app;