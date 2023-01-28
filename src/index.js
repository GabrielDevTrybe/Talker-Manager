// const { response } = require('express');
const express = require('express');
const endPointTalker = require('./end points/talker');
const endPointLogin = require('./end points/login');

const app = express();
app.use(express.json());
app.use('/talker', endPointTalker);
app.use('/login', endPointLogin);

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});
