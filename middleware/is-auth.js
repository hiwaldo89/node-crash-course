const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
  } catch (e) {
    e.statusCode = 500;
    throw e;
  }
  if (!authHeader || !decodedToken) {
    const error = new Error('Not authenticated');
    error.statusCode = 401;
  }
  req.userId = decodedToken.userId;
  next();
};
