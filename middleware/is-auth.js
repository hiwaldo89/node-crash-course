const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

module.exports = (req, res, next) => {
  const token = req.get('Authorization');
  let decodedToken;
  if (!token) {
    const error = new Error('Not authenticated');
    error.statusCode = 401;
    throw error;
  }
  try {
    decodedToken = jwt.verify(token, `${process.env.TOKEN_SECRET}`);
  } catch (e) {
    e.statusCode = 500;
    throw e;
  }
  req.userId = decodedToken.userId;
  next();
};
