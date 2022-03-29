const express = require('express');
require('./db/mongoose')
const userRouter = require('./routers/users');
const uploadRouter = require('./routers/uploads');
let compression = require('compression');
const helmet = require("helmet"); 

// Initialize the express server
const app = express();
// This middleware will compress response bodies for all requests that traverse through the middleware
app.use(compression());
// This middleware will secure the Express app by setting various HTTP headers
app.use(helmet());
// It parses incoming JSON requests and puts the parsed data in req object
app.use(express.json());
// Load the router modules
app.use(userRouter);
app.use(uploadRouter);



module.exports = app;
