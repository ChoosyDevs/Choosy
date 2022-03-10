const express = require('express');
require('./db/mongoose')
const userRouter = require('./routers/users');
const uploadRouter = require('./routers/uploads');
let compression = require('compression');
const helmet = require("helmet"); 

const app = express();
app.use(compression());
app.use(helmet());
app.use(express.json());
app.use(userRouter);
app.use(uploadRouter);



module.exports = app;
