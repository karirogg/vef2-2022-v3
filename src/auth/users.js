import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import xss from 'xss';
import { conditionalUpdate, query } from '../lib/db.js';
import { logger } from '../lib/logger.js';

dotenv.config();

/**
 * Hjálparföll fyrir notendur, uppfletting, búa til, uppfæra.
 */

const { BCRYPT_ROUNDS: bcryptRounds = 10 } = process.env;

export async function createUser(name, username, password) {
  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(bcryptRounds, 10)
  );

  const q = `
    INSERT INTO
      public.users (name, username, password)
    VALUES
      ($1, $2, $3)
    RETURNING *`;

  const values = [xss(name), xss(username), hashedPassword];
  const result = await query(q, values);

  return result.rows[0];
}

export async function comparePasswords(password, hash) {
  const result = await bcrypt.compare(password, hash);

  return result;
}

export async function findByUsername(username) {
  const q = 'SELECT * FROM users WHERE username = $1';

  try {
    const result = await query(q, [username]);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    logger.error('unable to query user by username');
    return null;
  }

  return false;
}

export async function findById(id) {
  const q = 'SELECT * FROM users WHERE id = $1';

  try {
    const result = await query(q, [id]);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('Gat ekki fundið notanda eftir id');
  }

  return null;
}

function isInt(i) {
  return i !== '' && Number.isInteger(Number(i));
}

// TODO move to utils
function isString(s) {
  return typeof s === 'string';
}

// TODO refactor
export async function updateUser(id, password, email) {
  if (!isInt(id)) {
    return null;
  }

  const fields = [
    isString(password) ? 'password' : null,
    isString(email) ? 'email' : null,
  ];

  let hashedPassword = null;

  if (password) {
    hashedPassword = await bcrypt.hash(password, parseInt(bcryptRounds, 10));
  }

  const values = [hashedPassword, isString(email) ? xss(email) : null];

  fields.push('updated');
  values.push(new Date());

  const result = await conditionalUpdate('users', id, fields, values);

  if (!result) {
    return null;
  }

  const updatedUser = result.rows[0];
  delete updatedUser.password;

  return updatedUser;
}

export async function listUsers() {
  const q = 'SELECT id, name, username FROM users';

  try {
    const result = await query(q);

    return result.rows;
  } catch (e) {
    console.error('Error fetching users');
  }

  return null;
}
