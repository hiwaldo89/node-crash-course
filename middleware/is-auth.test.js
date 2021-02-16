const jwt = require('jsonwebtoken');

const isAuth = require('./is-auth');

describe('isAuth middleware', () => {
  test('should throw an error if invalid token is passed', () => {
    const req = {
      get: () => {
        return 'mocktoken';
      },
    };
    expect(isAuth.bind(this, req, {}, () => {})).toThrow();
  });

  test('adds userId to request after verifying', () => {
    const req = {
      get: () => {
        return 'mocktoken';
      },
    };
    const spy = jest.spyOn(jwt, 'verify');
    spy.mockReturnValue({ userId: 'generatoredToken' });
    isAuth(req, {}, () => {});
    expect(req).toHaveProperty('userId');
    spy.mockRestore();
  });

  test('should throw an error if no token is passed', () => {
    const req = {
      get: () => {
        return null;
      },
    };
    expect(isAuth.bind(this, req, {}, () => {})).toThrow('Not authenticated');
  });
});
