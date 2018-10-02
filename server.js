const express = require('express');
const morgan = require('morgan');
const app = express();
app.use(morgan('common'));
app.use(express.static('public'));
app.listen(process.env.PORT || 8080);