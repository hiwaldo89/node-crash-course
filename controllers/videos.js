const { validationResult } = require('express-validator/check');

const Video = require('../models/video');
const User = require('../models/user');

exports.getVideos = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 12;
  let totalItems;
  Video.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Video.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((videos) => {
      res.status(200).json({
        message: 'Videos fetched',
        videos,
        totalItems,
      });
    })
    .catch((e) => {
      if (!e.statusCode) {
        e.statusCode = 500;
      }
      next(e);
    });
};

exports.getVideoById = (req, res, next) => {
  const videoId = req.params.videoId;
  Video.findById(videoId)
    .then((video) => {
      if (!video) {
        const error = new Error('Cannot find video with that id');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Fetched video', video });
    })
    .catch((e) => {
      if (!e.statusCode) {
        e.statusCode = 500;
      }
      next(e);
    });
};

exports.getUserVideos = (req, res, next) => {
  const userId = req.params.userId;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        const error = new Error('Cannot find user');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Fetched videos', videos: user.videos });
    })
    .catch((e) => {
      if (!e.statusCode) {
        e.statusCode = 500;
      }
      next(e);
    });
};

exports.createVideo = (req, res, next) => {
  const errors = validationResult(req);
  const { title, imageUrl, description } = req.body;
  let creator;
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  const video = new Video({
    title,
    imageUrl,
    description,
    creator: req.userId,
  });
  video
    .save()
    .then(() => {
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      user.videos.push(video);
      return user.save();
    })
    .then(() => {
      res.status(201).json({
        message: 'Video created',
        video,
        creator: { _id: creator._id, name: creator.name },
      });
    })
    .catch((e) => {
      if (!e.statusCode) {
        e.statusCode = 500;
      }
      next(e);
    });
};
