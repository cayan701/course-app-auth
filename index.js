const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const port = 3000;



app.listen(port, () => {
    console.log(`Port is listening on ${port}`);
})