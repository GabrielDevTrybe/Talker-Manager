// const { response } = require('express');
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const validateEmail = require('./validateEmail');
const validatePassword = require('./validatePassword');

// const { read } = require('fs');

const generateToken = require('./token');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

const talkersPath = path.resolve(__dirname, './talker.json');

const readFile = async () => {
  try {
    const data = await fs.readFile(talkersPath);
    return JSON.parse(data);
  } catch (error) {
    console.log(`Arquivo não pode ser lido: ${error}`);
  }
};

app.get('/talker', async (request, response) => {
  try {
    const talkers = await readFile();
    return response.status(200).json(talkers);
  } catch (error) {
    return response.status(500).send({ message: error.message });
  }
});

app.get('/talker/:id', async (request, response) => {
  const talkers = await readFile();
  const talker = talkers.find(({ id }) => id === Number(request.params.id));
  if (!talker) return response.status(404).send({ message: 'Pessoa palestrante não encontrada' });
  return response.status(200).json(talker);
});

app.post('/login', validatePassword, validateEmail, (request, response) => {
  const { email, password } = request.body;

  if ([email, password].includes(undefined)) {
    return response.status(401).json({ message: 'Campos ausentes!' });
  }

  const token = generateToken();
  return response.status(200).json({ token });
});

app.listen(PORT, () => {
  console.log('Online');
});
