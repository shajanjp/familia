require('dotenv').config();
const mongoose = require('./config/mongoose'),
express = require('./config/express');

const db = mongoose();
const	app = express();

app.listen(3000, function() {
	console.log('Server started at http://localhost:3000');
});