const express = require('express')
const app = express();
const UserRouter = require('./empRouter')
const oauthRouter = require('./oauthRouter')



app.use('/user',UserRouter)

app.use('/user',oauthRouter)

module.exports= app;