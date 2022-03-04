import { query } from '../lib/db.js';

export async function createEvent({ name, creatorID, slug, description } = {}) {
  const q = `
    INSERT INTO events
      (name, creator_id, slug, description)
    VALUES
      ($1, $2, $3, $4)
    RETURNING id, creator_id, name, slug, description;
  `;

  const values = [name, creatorID, slug, description];
  const result = await query(q, values);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

// Updatear ekki description, erum ekki að útfæra partial update
export async function updateEvent(id, { name, slug, description } = {}) {
  const q = `
    UPDATE events
      SET
        name = $1,
        slug = $2,
        description = $3,
        updated = CURRENT_TIMESTAMP
    WHERE
      id = $4
    RETURNING id, name, slug, description;
  `;

  const values = [name, slug, description, id];

  const result = await query(q, values);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function deleteEvent(eventID) {
  const q1 = `
    DELETE FROM registrations
    WHERE event_id = $1
  `;

  const q2 = `
    DELETE FROM events
    WHERE id = $1
  `;

  const deleteFromRegistrations = await query(q1, [eventID]);
  const deleteFromEvents = await query(q2, [eventID]);

  if (deleteFromEvents && deleteFromRegistrations) {
    return 1;
  }

  return null;
}

export async function register({ comment, eventID, userID } = {}) {
  const q = `
    INSERT INTO registrations
      (comment, event_id, user_id)
    VALUES
      ($1, $2, $3)
    RETURNING
      id, comment, event_id, user_id;
  `;
  const values = [comment, eventID, userID];
  const result = await query(q, values);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function unregister({ eventID, userID } = {}) {
  const q = `
    DELETE FROM registrations
    WHERE event_id = $1 AND user_id = $2;
  `;
  const values = [eventID, userID];
  const result = await query(q, values);

  if (result) {
    return 1;
  }

  return null;
}

export async function listEvents() {
  const q = `
    SELECT
      id, name, creator_id, slug, description, created, updated
    FROM
      events
  `;

  const result = await query(q);

  if (result) {
    return result.rows;
  }

  return null;
}

export async function listEvent(id) {
  const q = `
    SELECT
      events.id as id, creator_id, events.name as name, users.username as creator, slug, description, created, updated
    FROM
      events
    JOIN
      users ON events.creator_id = users.id
    WHERE events.id = $1
  `;

  const result = await query(q, [id]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

// TODO gætum fellt þetta fall saman við það að ofan
export async function listEventByName(name) {
  const q = `
    SELECT
      id, name, creator_id, slug, description, created, updated
    FROM
      events
    WHERE name = $1
  `;

  const result = await query(q, [name]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function listRegistered(eventID) {
  const q = `
    SELECT
      users.name, registrations.comment
    FROM
      registrations
    JOIN
      users ON registrations.user_id = users.id
    WHERE registrations.event_id = $1
  `;

  const result = await query(q, [eventID]);

  if (result) {
    return result.rows;
  }

  return null;
}

export const requireRegisteredToBe =
  (wantRegistered) => async (req, res, next) => {
    const { id } = req.params;

    const q = `
    SELECT
      *
    FROM
      registrations
    WHERE event_id = $1 AND user_id = $2
  `;

    const result = await query(q, [id, req.user.id]);

    if (result && result.rowCount === 0) {
      return wantRegistered
        ? res.status(400).json({
            error: 'Þú ert ekki skráð/ur á viðburðinn.',
          })
        : next();
    }
    if (result && result.rowCount > 0) {
      return wantRegistered
        ? next()
        : res.status(400).json({
            error: 'Þú ert nú þegar skráð/ur á viðburðinn.',
          });
    }

    return res.status(400).json({
      error: 'Villa kom upp',
    });
  };
