const express = require('express');
const { body } = require('express-validator');

const isAuth = require('../middleware/is-auth');
const videosController = require('../controllers/videos');

const router = express.Router();

router.get('/videos', videosController.getVideos);
router.get('/videos/:videoId', videosController.getVideoById);
router.get('/videos/user/:userId', videosController.getUserVideos);
router.post('/videos', isAuth, [
  body('title').trim().isLength({ min: 3 }),
  body('description').trim().isLength({ min: 3 }),
  body('imageUrl').trim().isLength({ min: 3 }),
  videosController.createVideo,
]);

module.exports = router;
