// const { response } = require('express');
const crypto = require('crypto');
const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const talkersPath = path.resolve(__dirname, './talker.json');

const {
  validateToken,
  validateName, 
  validateAge, 
  validateTalk, 
  verifyRate,
 } = require('./middlewares/verifyTalkers');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

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

app.post('/login', (request, response) => {
  const { email, password } = request.body;
  const token = crypto.randomBytes(8).toString('hex');
  const REGEX = /\S+@\S+\.\S+/;

  if (!email) {
    return response.status(400).json({ message: 'O campo "email" é obrigatório' });
  }
  if (!REGEX.test(email)) {
    return response.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }
  if (!password) {
    return response.status(400).json({ message: 'O campo "password" é obrigatório' });
  }
  if (password.length < 4) {
    return response.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }
  return response.status(200).json({ token });
});

app.post('/talker',
 validateToken, validateName, validateAge, validateTalk, verifyRate, async (request, response) => {
    const { name, age, talk } = request.body;
    const talkers = await readFile();
    const newTalker = {
      name,
      age,
      id: talkers[talkers.length - 1].id + 1,
      talk,
    };

    const newTalkers = JSON.stringify([...talkers, newTalker]);
    await fs.writeFile(talkersPath, (newTalkers));
    return response.status(201).json(newTalker);
}); 

app.put('/talker/:id', validateToken, validateName, validateAge, validateTalk, verifyRate,
 async (req, res) => {
  const { id } = req.params;
  const { name, age, talk } = req.body;
  const talkers = await readFile();
  const index = talkers.findIndex((element) => element.id === Number(id));
  talkers[index] = { id: Number(id), name, age, talk };
  const updateTalkers = JSON.stringify(talkers, null, 2);
  await fs.writeFile(talkersPath, updateTalkers);

  res.status(200).json(talkers[index]);
});

app.listen(PORT, () => {
  console.log('Online');
});
