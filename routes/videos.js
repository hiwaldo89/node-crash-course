const express = require('express');
const { body } = require('express-validator/check');

const isAuth = require('../middleware/is-auth');
const videosController = require('../controllers/videos');

const router = express.Router();

router.get('/videos', isAuth, videosController.getVideos);
router.post('/videos', isAuth, [
  body('title').trim().isLength({ min: 3 }),
  body('description').trim().isLength({ min: 3 }),
  body('imageUrl').trim().isLength({ min: 3 }),
  videosController.createVideo,
]);

module.exports = router;
