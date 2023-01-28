const express = require('express');
const crypto = require('crypto');

const endPoint = express.Router();

const validateLogin = (request, response, next) => {
  const { email, password } = request.body;
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
  next();
};

endPoint.post('/', validateLogin, (req, res) => {
  const token = crypto.randomBytes(8).toString('hex');

  return res.status(200).json({ token });
});

module.exports = endPoint;