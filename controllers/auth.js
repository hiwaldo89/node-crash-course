const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const User = require('../models/user');

dotenv.config();

exports.signUp = async (req, res, next) => {
  const { email, password, name } = req.body;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed.');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      password: hashedPassword,
      name,
    });
    const savedUser = await user.save();

    res.status(201).json({ message: 'User created', userId: savedUser._id });
    return;
  } catch (err) {
    next(err);
    return err;
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error('No user found with that information');
      error.statusCode = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Incorrect password');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      process.env.TOKEN_SECRET,
      { expiresIn: '5h' }
    );

    res.status(200).json({ token, userId: loadedUser._id.toString() });
    return;
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
    return err;
  }
};

exports.updateUserFavoriteVideos = async (req, res, next) => {
  const { videoId } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    if (
      user.favoriteVideos
        .map((id) => id.toString())
        .includes(videoId.toString())
    ) {
      user.favoriteVideos = user.favoriteVideos.filter(
        (video) => video.toString() !== videoId.toString()
      );
    } else {
      user.favoriteVideos = [...user.favoriteVideos, videoId];
    }
    const updatedUser = await user.save();
    res.status(200).json({
      message: 'Favorites updated',
      favorites: updatedUser.favoriteVideos,
    });
    return;
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
    return err;
  }
};
