require('dotenv').config();
const mongoose = require('./config/mongoose'),
const express = require('./config/express');

mongoose();

const app = express();

app.listen(3000, function() {
	console.log('Server started at http://localhost:3000');
});