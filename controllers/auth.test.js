const expressValidator = require('express-validator');
const mongoose = require('mongoose');

const { signUp, login, updateUserFavoriteVideos } = require('./auth');
const User = require('../models/user');

jest.mock('express-validator');

const mockRes = {
  json: function (data) {
    this.data = data;
  },
  status: function (statusCode) {
    this.statusCode = statusCode;
    return this;
  },
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
      user.save();
    })
    .catch((e) => console.log('err: ', e));
});

afterAll(() => {
  User.deleteMany({})
    .then(() => {
      return mongoose.disconnect();
    })
    .catch((e) => console.log('err: ', e));
});

describe('signUp function', () => {
  test('Should throw an error if the body is not valid', (done) => {
    const req = {
      body: { email: 'invalidemail', password: '', name: '' },
    };
    expressValidator.validationResult.mockImplementation(() => ({
      isEmpty: jest.fn().mockReturnValue(false),
      array: jest.fn().mockReturnValue([{ test: 'error' }]),
    }));

    signUp(req, {}, () => {}).then((result) => {
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Validation failed.');
      done();
    });
  });

  test('Should create user', (done) => {
    const req = {
      body: {
        email: 'test2@test.com',
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

    signUp(req, res, () => {}).then(() => {
      expect(res.statusCode).toBe(201);
      done();
    });
  });
});

describe('login function', () => {
  test('Should throw and error if no user is found', (done) => {
    const req = {
      body: {
        email: '',
        password: '',
      },
    };
    login(req, {}, () => {}).then((res) => {
      expect(res).toBeInstanceOf(Error);
      expect(res.message).toBe('No user found with that information');
      done();
    });
  });

  test('Should throw error if password does not match', (done) => {
    const req = {
      body: {
        email: 'test@test.com',
        password: 'incorrectpassword',
      },
    };
    login(req, {}, () => {}).then((res) => {
      expect(res).toBeInstanceOf(Error);
      expect(res.message).toBe('Incorrect password');
      done();
    });
  });
});

describe('updateUserFavorites function', () => {
  test('Should throw an error if no user is found', (done) => {
    const req = {
      userId: 'incorrectUserId',
      body: {
        videoId: 'test',
      },
    };
    updateUserFavoriteVideos(req, {}, () => {}).then((res) => {
      expect(res).toBeInstanceOf(Error);
      done();
    });
  });

  test('Should add video to favorites if its not already there or remove it if its already in there', (done) => {
    const videoId = mongoose.Types.ObjectId('602c0182b04cd012031f9e5a');
    const req = {
      userId: '5c0f66b979af55031b34728a',
      body: {
        videoId,
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
    updateUserFavoriteVideos(req, res, () => {}).then(() => {
      expect(res.data.favorites).toContainEqual(videoId);
      updateUserFavoriteVideos(req, res, () => {}).then(() => {
        expect(res.data.favorites).not.toContainEqual(videoId);
        done();
      });
    });
  });
});
