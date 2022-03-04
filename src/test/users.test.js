import { describe, expect, test } from '@jest/globals';
import dotenv from 'dotenv';
import {
  fetchAndParse,
  generatedName,
  generatedPassword,
  generatedUsername,
  loginAndReturnToken,
  loginAsHardcodedAdminAndReturnToken,
  postAndParse,
} from './test-utils.js';

dotenv.config();

const { TOKEN_LIFETIME: tokenLifetime = 3600 } = process.env;

describe('users', () => {
  const name = generatedName;
  const username = generatedUsername;
  const password = generatedPassword;

  test('POST /users/register, success', async () => {
    const data = { name, username, password };
    const { result, status } = await postAndParse('/users/register', data);

    expect(status).toBe(201);
    expect(result.name).toBe(name);
    expect(result.username).toBe(username);
    expect(result.password).toBeUndefined();
  });

  test('POST /users/login, success', async () => {
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

  test('GET /users/me', async () => {
    const token = await loginAndReturnToken({ username, password });
    expect(token).toBeTruthy();

    const { result, status } = await fetchAndParse('/users/me', token);

    expect(status).toBe(200);
    expect(result.admin).toBe(false);
    expect(result.name).toBe(name);
    expect(result.username).toBe(username);
    expect(result.password).toBeUndefined();
  });

  test('GET /users/, as admin', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();

    const { result, status } = await fetchAndParse('/users/', token);

    expect(status).toBe(200);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBe('Admin');
  });

  test('GET /users/:id/, as admin', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();

    const { result, status } = await fetchAndParse('/users/1', token);

    expect(status).toBe(200);
    expect(result.name).toBe('Admin');
    expect(result.username).toBe('admin');
  });
});
