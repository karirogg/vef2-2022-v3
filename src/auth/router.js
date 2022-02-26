import express from 'express';
import jwt from 'jsonwebtoken';
import { catchErrors } from '../lib/catch-errors.js';
import { logger } from '../lib/logger.js';
import { validationCheck } from '../validation/helpers.js';
import {
  passwordValidator,
  usernameAndPaswordValidValidator,
  usernameDoesNotExistValidator,
  usernameValidator,
} from '../validation/validators.js';
import {
  jwtOptions,
  requireAdmin,
  requireAuthentication,
  tokenOptions,
} from './passport.js';
import { createUser, findById, findByUsername, listUsers } from './users.js';

/**
 * Skilgreinir API fyrir nýskráningu, innskráningu notanda, ásamt því að skila
 * upplýsingum um notanda og uppfæra þær.
 */

export const router = express.Router();

async function registerRoute(req, res) {
  const { name, username, password = '' } = req.body;

  const result = await createUser(name, username, password);

  delete result.password;

  return res.status(201).json(result);
}

async function loginRoute(req, res) {
  const { username } = req.body;

  const user = await findByUsername(username);

  if (!user) {
    logger.error('Unable to find user', username);
    return res.status(500).json({});
  }

  const payload = { id: user.id };
  const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);
  delete user.password;

  return res.json({
    user,
    token,
    expiresIn: tokenOptions.expiresIn,
  });
}

async function currentUserRoute(req, res) {
  const { user: { id } = {} } = req;

  const user = await findById(id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  delete user.password;

  return res.json(user);
}

async function viewUsersRoute(req, res) {
  const userList = await listUsers();

  if (!userList) {
    return res.status(404).json({ error: 'Error fetching users' });
  }

  return res.json(userList);
}

async function viewUserByID(req, res) {
  const user = await findById(req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  delete user.password;

  return res.json(user);
}

router.post(
  '/register',
  usernameValidator,
  passwordValidator,
  usernameDoesNotExistValidator,
  validationCheck,
  catchErrors(registerRoute)
);

router.post(
  '/login',
  usernameValidator,
  passwordValidator,
  usernameAndPaswordValidValidator,
  validationCheck,
  catchErrors(loginRoute)
);

router.get('/me', requireAuthentication, catchErrors(currentUserRoute));

router.get('/', requireAdmin, catchErrors(viewUsersRoute));

router.get('/:id', requireAdmin, viewUserByID);
