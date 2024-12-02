const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const cors = require('cors');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
