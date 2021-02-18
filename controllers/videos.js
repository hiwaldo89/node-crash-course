const { validationResult } = require('express-validator');

const Video = require('../models/video');
const User = require('../models/user');

exports.getVideos = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 12;

  try {
    const totalVideos = await Video.find().countDocuments;
    const videos = await Video.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    res.status(200).json({ message: 'Videos fetched', videos, totalVideos });
    return;
  } catch (err) {
    next(err);
    return err;
  }
};

exports.getVideoById = async (req, res, next) => {
  const { videoId } = req.params;

  try {
    const video = await Video.findById(videoId);
    if (!video) {
      const error = new Error('Cannot find video with that id');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: 'Fetched video', video });
    return;
  } catch (err) {
    next(err);
    return err;
  }
};

exports.getUserVideos = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Cannot find user');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: 'Fetched videos', videos: user.videos });
    return;
  } catch (err) {
    next(err);
    return err;
  }
};

exports.createVideo = async (req, res, next) => {
  const errors = validationResult(req);
  const { title, imageUrl, description } = req.body;

  try {
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
    const savedVideo = await video.save();
    const user = await User.findById(req.userId);
    user.videos.push(savedVideo);
    await user.save();
    res.status(201).json({
      message: 'Video created',
      video: savedVideo,
      creator: { _id: user._id, name: user.name },
    });
    return;
  } catch (err) {
    next(err);
    return err;
  }
};

exports.deleteVideo = async (req, res, next) => {
  const { videoId } = req.params;

  try {
    const video = await Video.findById(videoId);
    if (!video) {
      const error = new Error('Could not find video');
      error.statusCode = 404;
      throw error;
    }
    if (video.creator.toString() !== req.userId) {
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }
    await Video.findByIdAndRemove(videoId);
    const user = await User.findById(req.userId);
    user.videos.pull(videoId);
    await user.save();

    res.status(200).json({ message: 'Deleted video' });
    return;
  } catch (err) {
    next(err);
    return err;
  }
};
