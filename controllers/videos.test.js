const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Video = require('../models/video');
const User = require('../models/user');

dotenv.config();

const closeDb = async () => {
  await User.deleteMany({});
  await Video.deleteMany({});
  mongoose.disconnect();
};

beforeAll(() => {
  mongoose
    .connect(`${process.env.MONGO_TEST_DB}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      const user = new User({
        email: 'test@test.com',
        password: 'tester',
        name: 'Test',
        _id: '5c0f66b979af55031b34728a',
      });
      const video = new Video({
        title: 'Test title',
        imageUrl: 'testImgUrl',
        description: 'Test description',
        creator: savedUser._id,
      });
      user.save();
      video.save();
    });
});

afterAll(() => {
  closeDb();
});

describe('getVideos function', () => {
  test('test', () => {
    expect(1 + 1).toBe(2);
  });
});
