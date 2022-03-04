import { describe, expect, test } from '@jest/globals';
import dotenv from 'dotenv';
import {
  createRandomUserAndReturnWithToken,
  deleteAndParse,
  fetchAndParse,
  getNewestEventID,
  loginAsNewUserAndReturnToken,
  postAndParse,
} from './test-utils.js';

dotenv.config();

describe('events', () => {
  test('GET /events/', async () => {
    const { result, status } = await fetchAndParse('/events/');

    expect(status).toBe(200);
    expect(result).toBeDefined();
  });

  test('POST /events/, as logged in user', async () => {
    const token = await loginAsNewUserAndReturnToken();

    const newEvent = {
      name: 'Test event',
      description: 'This is a test event',
    };

    const { result, status } = await postAndParse('/events/', newEvent, token);

    console.log(result);

    expect(status).toBe(201);
    expect(result.name).toBe('Test event');
    expect(result.description).toBe('This is a test event');
  });

  test('GET /events/:id', async () => {
    const token = await loginAsNewUserAndReturnToken();
    const newUser = await fetchAndParse('/users/me', token);

    const newestID = await getNewestEventID();

    const { result, status } = await fetchAndParse(`/events/${newestID}`);

    expect(status).toBe(200);
    expect(result.event.name).toBe('Test event');
    expect(result.event.description).toBe('This is a test event');
    expect(result.event.creator_id).toBe(newUser.id);
    expect(result.registrations).toBeDefined();
  });

  test('POST /events/:id/register, as logged in user', async () => {
    const { token, user } = await createRandomUserAndReturnWithToken();

    const newestID = await getNewestEventID();

    const data = { comment: 'Test comment' };

    const { result, status } = await postAndParse(
      `/events/${newestID}/register`,
      data,
      token
    );

    expect(status).toBe(201);
    expect(result.comment).toBe('Test comment');
    expect(result.event_id).toBe(newestID);
    expect(result.user_id).toBe(user.id);
  });

  test('DELETE /events/:id, as creator', async () => {
    const token = await loginAsNewUserAndReturnToken();
    const newestID = await getNewestEventID();

    const { result, status } = await deleteAndParse(
      `/events/${newestID}`,
      token
    );

    expect(status).toBe(200);
    expect(result.msg).toBe('Viðburði eytt');
  });
});
