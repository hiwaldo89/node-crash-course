const { signUp } = require('./auth');

describe('signUp function', () => {
  test('Should throw an error if the body is not valid', () => {
    const req = {
      body: { email: 'invalidemail', password: '', name: '' },
    };
    expect(signUp.bind(this, req, {}, () => {})).toThrow('Validation failed.');
  });
});
