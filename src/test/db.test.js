import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { createUser } from '../auth/users.js';
import { createEvent } from '../events/events.js';
import { createSchema, dropSchema, end } from '../lib/db.js';
import { slugify } from '../lib/slugify.js';
import { randomValue } from './test-utils.js';

/**
 * Hér er test gagnagrunnur búinn til og hent áður en test eru keyrð.
 * package.json sér um að nota dotenv-cli til að loada .env.test sem vísar í þann gagnagrunn
 * sem ætti *ekki* að vera sá sami og við notum „almennt“
 */

describe('db', () => {
  beforeAll(async () => {
    await dropSchema();
    await createSchema();
  });

  afterAll(async () => {
    await end();
  });

  it('creates an admin user', async () => {
    const created = await createUser('Admin', 'admin', '1234567890');

    expect(created.name).toBe('Admin');
  });

  it('creates a valid event and returns it', async () => {
    // TODO útfæra test

    const rnd = randomValue();

    const created = await createEvent({
      name: rnd,
      creatorID: 1,
      slug: slugify(rnd),
      description: `This is a ${rnd}`,
    });

    expect(created.name).toBe(rnd);
    expect(created.slug).toBe(slugify(rnd));
    expect(created.description).toBe(`This is a ${rnd}`);
  });
});
