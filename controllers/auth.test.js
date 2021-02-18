const expressValidator = require('express-validator');
const mongoose = require('mongoose');

const { signUp, login, updateUserFavoriteVideos } = require('./auth');
const User = require('../models/user');

jest.mock('express-validator');

beforeAll(async () => {
  await mongoose.connect(`${process.env.MONGO_URL}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterEach(async () => {
  await User.deleteMany().exec();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('signUp function', () => {
  test('Should throw an error if the body is not valid', async (done) => {
    const req = {
      body: { email: 'invalidemail', password: '', name: '' },
    };
    expressValidator.validationResult.mockImplementation(() => ({
      isEmpty: jest.fn().mockReturnValue(false),
      array: jest.fn().mockReturnValue([{ test: 'error' }]),
    }));

    const result = await signUp(req, {}, () => {});
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('Validation failed.');
    done();
  });

  test('Should create user', async (done) => {
    const req = {
      body: {
        email: 'test@test.com',
        password: 'testpassword',
        name: 'testuser',
      },
    };
    const res = {
      json: function (data) {
        this.data = data;
      },
      status: function (statusCode) {
        this.statusCode = statusCode;
        return this;
      },
    };
    expressValidator.validationResult.mockImplementation(() => ({
      isEmpty: jest.fn().mockReturnValue(true),
    }));

    await signUp(req, res, () => {});
    expect(res.statusCode).toBe(201);
    done();
  });
});

describe('login function', () => {
  test('Should throw and error if no user is found', async (done) => {
    const req = {
      body: {
        email: '',
        password: '',
      },
    };
    const response = await login(req, {}, () => {});
    expect(response).toBeInstanceOf(Error);
    expect(response.message).toBe('No user found with that information');
    done();
  });

  test('Should throw error if password does not match', async (done) => {
    const signupReq = {
      body: {
        email: 'test@test.com',
        password: 'testpassword',
        name: 'testuser',
      },
    };
    const loginReq = {
      body: {
        email: 'test@test.com',
        password: 'incorrectpassword',
      },
    };

    await signUp(signupReq, {}, () => {});
    const response = await login(loginReq, {}, () => {});
    expect(response).toBeInstanceOf(Error);
    expect(response.message).toBe('Incorrect password');
    done();
  });
});

describe('updateUserFavorites function', () => {
  test('Should throw an error if no user is found', async (done) => {
    const req = {
      userId: mongoose.Types.ObjectId('5c0f66b979af55031b34728a'),
      body: {
        videoId: 'test',
      },
    };
    const response = await updateUserFavoriteVideos(req, {}, () => {});
    expect(response).toBeInstanceOf(Error);
    expect(response.message).toBe('User not found');
    done();
  });

  test('Should add video to favorites if its not already there or remove it if its already in there', async (done) => {
    const videoId = mongoose.Types.ObjectId('602c0182b04cd012031f9e5a');
    const signupReq = {
      body: {
        email: 'test@test.com',
        password: 'testpassword',
        name: 'testuser',
      },
    };
    const res = {
      json: function (data) {
        this.data = data;
      },
      status: function (statusCode) {
        this.statusCode = statusCode;
        return this;
      },
    };

    await signUp(signupReq, res, () => {});

    const req = {
      userId: res.data.userId,
      body: {
        videoId,
      },
    };

    await updateUserFavoriteVideos(req, res, () => {});
    expect(res.data.favorites).toContainEqual(videoId);

    await updateUserFavoriteVideos(req, res, () => {});
    expect(res.data.favorites).not.toContainEqual(videoId);

    done();
  });
});
