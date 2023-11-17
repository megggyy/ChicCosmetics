const express = require('express');
const app = express();
const cookie = require('cookie-parser')
const cors = require('cors')

const products = require('./routes/product');
const auth = require('./routes/auth')
const order = require('./routes/order')
const brand= require('./routes/brand');

app.use(cors())
app.use(express.json({limit:'50mb'}));

app.use(express.urlencoded({limit: "50mb", extended: true }));
app.use(cookie());
app.use('/api/v1', products);
app.use('/api/v1', brand);
app.use('/api/v1', auth);
app.use('/api/v1', order);

module.exports = app