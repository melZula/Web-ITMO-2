const express = require('express');
const path = require('path');
const router = require('./router');
const app = express();

const port = process.env.PORT;

app.use(express.static(path.join(__dirname, '../public')));

app.use('/', router);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
