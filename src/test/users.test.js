import { describe, expect, test } from '@jest/globals';
import dotenv from 'dotenv';
import {
  fetchAndParse,
  loginAndReturnToken,
  postAndParse,
  randomValue,
} from './test-utils.js';

dotenv.config();

const { TOKEN_LIFETIME: tokenLifetime = 3600 } = process.env;

describe('users', () => {
  const rnd = randomValue();

  const name = rnd;
  const username = `user${rnd}`;
  const password = '1234567890';

  test('Create user, successful', async () => {
    const data = { name, username, password };
    const { result, status } = await postAndParse('/users/register', data);

    expect(status).toBe(201);
    expect(result.name).toBe(name);
    expect(result.username).toBe(username);
    expect(result.password).toBeUndefined();
  });

  test('Login user, success', async () => {
    const data = { username, password };
    const { result, status } = await postAndParse('/users/login', data);

    expect(status).toBe(200);
    expect(result.expiresIn).toBe(parseInt(tokenLifetime, 10));
    expect(result.token.length).toBeGreaterThanOrEqual(20); // 20 is random
    expect(result.user.admin).toBe(false);
    expect(result.user.name).toBe(name);
    expect(result.user.username).toBe(username);
    expect(result.user.password).toBeUndefined();
  });

  test('Logged in user data on /users/me', async () => {
    const token = await loginAndReturnToken({ username, password });
    expect(token).toBeTruthy();

    const { result, status } = await fetchAndParse('/users/me', token);

    expect(status).toBe(200);
    expect(result.admin).toBe(false);
    expect(result.name).toBe(name);
    expect(result.username).toBe(username);
    expect(result.password).toBeUndefined();
  });
});
