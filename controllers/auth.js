const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const User = require('../models/user');
const Video = require('../models/video');

dotenv.config();

exports.signUp = (req, res, next) => {
  console.log(req.body);
  const errors = validationResult(req);
  const { email, password, name } = req.body;

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email,
        password: hashedPassword,
        name,
      });
      return user.save();
    })
    .then((result) => {
      res.status(201).json({ message: 'User created', userId: result._id });
    })
    .catch((e) => {
      if (!e.statusCode) {
        e.statusCode = 500;
      }
      next(e);
    });
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;
  let signedInUser;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        const error = new Error('No user found with that information');
        error.statusCode = 401;
        throw error;
      }
      signedInUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error('Incorrect password');
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: signedInUser.email,
          userId: signedInUser._id.toString(),
        },
        process.env.TOKEN_SECRET,
        { expiresIn: '5h' }
      );
      res
        .status(200)
        .json({
          token,
          userId: signedInUser._id.toString(),
          name: signedInUser.name,
        });
    })
    .catch((e) => {
      if (!e.statusCode) {
        e.statusCode = 500;
      }
      next(e);
    });
};

exports.updateUserFavoriteVideos = async (req, res, next) => {
  const { videoId } = req.body;
  const video = await Video.findById(videoId);

  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }
      // TODO: Add or remove video from favorites array
      return user.save();
    })
    .then(() => {
      res.status(200).json({ message: 'Favorites updated' });
    })
    .catch((e) => {
      if (!e.statusCode) {
        e.statusCode = 500;
      }
      next(e);
    });
};