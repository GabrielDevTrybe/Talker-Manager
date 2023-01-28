const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { readFile } = require('../utils/handleTalkers');

const endPoint = express.Router();
const talkersPath = path.resolve(__dirname, '../talker.json');

const {
  validateToken,
  validateName,
  validateAge,
  validateTalk,
  verifyRate,
} = require('../middlewares/verifyTalkers');

endPoint.get('/', async (request, response) => {
  try {
    const talkers = await readFile(talkersPath);
    return response.status(200).json(talkers);
  } catch (error) {
    return response.status(500).send({ message: error.message });
  }
});

endPoint.get('/:id', async (request, response) => {
  const talkers = await readFile(talkersPath);
  const talker = talkers.find(({ id }) => id === Number(request.params.id));
  if (!talker) return response.status(404).send({ message: 'Pessoa palestrante não encontrada' });
  return response.status(200).json(talker);
});

endPoint.post('/',
  validateToken, validateName, validateAge, validateTalk, verifyRate, async (request, response) => {
    const { name, age, talk } = request.body;
    const talkers = await readFile(talkersPath);
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

  endPoint.put('/:id', validateToken, validateName, validateAge, validateTalk, verifyRate,
  async (req, res) => {
    const { id } = req.params;
    const { name, age, talk } = req.body;
    const talkers = await readFile(talkersPath);
    const index = talkers.findIndex((element) => element.id === Number(id));
    talkers[index] = { id: Number(id), name, age, talk };
    const updateTalkers = JSON.stringify(talkers, null, 2);
    await fs.writeFile(talkersPath, updateTalkers);

    res.status(200).json(talkers[index]);
  });

endPoint.delete('/:id', validateToken,
async (req, res) => {
  const { id } = req.params;
  const talkers = await readFile(talkersPath);
  const filteredTalkers = talkers.filter((talker) => talker.id !== Number(id));
  const updatedTalkers = JSON.stringify(filteredTalkers, null, 2);
  await fs.writeFile(talkersPath, updatedTalkers);

  res.status(204).end();
});

module.exports = endPoint;