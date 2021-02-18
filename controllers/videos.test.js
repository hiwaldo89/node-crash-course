const mongoose = require('mongoose');
const dotenv = require('dotenv');
const expressValidator = require('express-validator');

const Video = require('../models/video');
const User = require('../models/user');
const {
  getVideos,
  getVideoById,
  getUserVideos,
  createVideo,
} = require('./videos');

jest.mock('express-validator');

dotenv.config();

beforeAll(async () => {
  await mongoose.connect(`${process.env.MONGO_URL}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterEach(async () => {
  await Video.deleteMany().exec();
  await User.deleteMany().exec();
});

afterAll(async () => {
  //await mongoose.connection.close();
  await mongoose.connection.close();
});

const res = {
  json: function (data) {
    this.data = data;
  },
  status: function (statusCode) {
    this.statusCode = statusCode;
    return this;
  },
};

describe('getVideos function', () => {
  const req = {
    query: {
      page: 1,
    },
  };
  test('Should return videos', async (done) => {
    await getVideos(req, res, () => {});
    expect(res.data.message).toBe('Videos fetched');
    done();
  });
});

describe('getVideoById function', () => {
  test('Should throw error if no video is found', async (done) => {
    const req = {
      params: {
        videoId: mongoose.Types.ObjectId('602c0182b04cd012031f9e5a'),
      },
    };
    const response = await getVideoById(req, {}, () => {});
    expect(response).toBeInstanceOf(Error);
    expect(response.message).toBe('Cannot find video with that id');
    done();
  });

  test('Should return found videos', async (done) => {
    const mockUser = new User({
      email: 'test@test.com',
      password: 'testpassword',
      name: 'testuser',
    });
    const user = await mockUser.save();

    const video = new Video({
      title: 'testvideo',
      imageUrl: 'testvideourl',
      description: 'testvideo description',
      creator: user._id,
    });
    const savedVideo = await video.save();

    const req = {
      params: {
        videoId: savedVideo._id,
      },
    };

    await getVideoById(req, res, () => {});
    expect(res.data.video._id.toString()).toBe(savedVideo._id.toString());
    done();
  });
});

describe('getUserVideos function', () => {
  test('Should return error if no user is found', async (done) => {
    const req = {
      params: {
        userId: mongoose.Types.ObjectId('602c0182b04cd012031f9e5a'),
      },
    };

    const response = await getUserVideos(req, {}, () => {});
    expect(response).toBeInstanceOf(Error);
    expect(response.message).toBe('Cannot find user');
    done();
  });

  test('Should return user videos', async (done) => {
    const mockUser = new User({
      email: 'test@test.com',
      password: 'testpassword',
      name: 'testuser',
    });
    const user = await mockUser.save();

    const req = {
      params: {
        userId: user._id,
      },
    };

    await getUserVideos(req, res, () => {});
    expect(res.data.message).toBe('Fetched videos');
    expect(res.data.videos).toHaveLength(0);
    done();
  });
});

describe('createVideo function', () => {
  test('Should throw error if invalid request', async (done) => {
    expressValidator.validationResult.mockImplementation(() => ({
      isEmpty: jest.fn().mockReturnValue(false),
      array: jest.fn().mockReturnValue([{ test: 'error' }]),
    }));

    const req = {
      body: {
        title: '',
        imageUrl: '',
        description: '',
      },
    };

    const response = await createVideo(req, {}, () => {});
    expect(response).toBeInstanceOf(Error);
    expect(response.message).toBe(
      'Validation failed, entered data is incorrect.'
    );
    done();
  });

  test('Should add video to users video', async (done) => {
    expressValidator.validationResult.mockImplementation(() => ({
      isEmpty: jest.fn().mockReturnValue(true),
    }));

    const mockUser = new User({
      email: 'test@test.com',
      password: 'testpassword',
      name: 'testuser',
    });

    const user = await mockUser.save();

    const req = {
      body: {
        title: 'testvideo',
        imageUrl: 'testvideourl',
        description: 'testvideo description',
      },
      userId: user._id,
    };

    await createVideo(req, res, () => {});
    expect(res.data.message).toBe('Video created');
    done();
  });
});
