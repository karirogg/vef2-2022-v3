import express from 'express';
import { validationResult } from 'express-validator';
import { requireAuthentication } from '../auth/passport.js';
import { catchErrors } from '../lib/catch-errors.js';
import { slugify } from '../lib/slugify.js';
import {
  registrationValidationMiddleware,
  requireNameDoesNotExist,
  requireNameNonempty,
  requireUserCreatedOrIsAdmin,
  xssSanitizationMiddleware,
} from '../validation/validators.js';
import {
  createEvent,
  deleteEvent,
  listEvent,
  listEvents,
  listRegistered,
  register,
  requireRegisteredToBe,
  unregister,
  updateEvent,
} from './events.js';

export const router = express.Router();

async function indexRoute(req, res) {
  const events = await listEvents();

  return res.json(events);
}

async function eventRoute(req, res, next) {
  const { id } = req.params;
  const event = await listEvent(id);

  if (!event) {
    return next();
  }

  const registrations = await listRegistered(event.id);

  return res.json({
    event,
    registrations,
  });
}

async function createEventRoute(req, res) {
  const { name, description } = req.body;
  const slug = slugify(name);

  const created = await createEvent({
    name,
    creatorID: req.user.id,
    slug,
    description,
  });

  if (created) {
    return res.status(201).json(created);
  }

  return res.status(400).json({
    msg: 'Villa við að búa til viðburð!',
  });
}

async function updateEventRoute(req, res) {
  const { name, description } = req.body;
  const { id } = req.params;

  try {
    const event = await listEvent(id);

    const newName = name && name !== '' ? name : event.name;
    const newSlug = slugify(newName);
    const newDescription =
      description && name !== '' ? description : event.description;

    const updated = await updateEvent(event.id, {
      name: newName,
      slug: newSlug,
      description: newDescription,
    });

    if (updated) {
      return res.status(200).json(updated);
    }
  } catch {
    return res.status(404).json({ error: 'Viðburður fannst ekki.' });
  }

  return res.status(404);
}

async function deleteEventRoute(req, res) {
  const { id } = req.params;

  const correspondingEvent = await listEvent(id);

  if (!correspondingEvent) {
    return res.status(404).json({ error: 'Viðburður fannst ekki.' });
  }

  const deleted = await deleteEvent(id);

  if (deleted) {
    return res.status(200).json({
      msg: 'Viðburði eytt',
    });
  }

  return res.status(400).json({
    error: 'Villa kom upp við að eyða viðburði',
  });
}

async function registerRoute(req, res) {
  const { comment } = req.body;
  const { id } = req.params;
  const event = await listEvent(id);

  const registered = await register({
    comment,
    eventID: event.id,
    userID: req.user.id,
  });

  if (registered) {
    return res.status(201).json(registered);
  }

  return res.status(400).json({
    error: 'Villa kom upp við skráningu',
  });
}

async function unregisterRoute(req, res) {
  const { id } = req.params;
  const event = await listEvent(id);

  const unregistered = await unregister({
    eventID: event.id,
    userID: req.user.id,
  });

  if (unregistered) {
    return res.json({
      msg: 'Skráningu eytt',
    });
  }

  return res.json({
    error: 'Villa kom upp við skráningu',
  });
}

const validationResults = async (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json({
      errors: result.errors,
    });
  }

  return next();
};

router.get('/', catchErrors(indexRoute));

// Sanitation and validation
router.post(
  '/',
  requireAuthentication,
  requireNameNonempty,
  requireNameDoesNotExist,
  registrationValidationMiddleware('description'),
  xssSanitizationMiddleware('name'),
  xssSanitizationMiddleware('description'),
  validationResults,
  catchErrors(createEventRoute)
);

router.get('/:id', catchErrors(eventRoute));
router.patch(
  '/:id',
  requireAuthentication,
  requireUserCreatedOrIsAdmin,
  registrationValidationMiddleware('description'),
  xssSanitizationMiddleware('name'),
  xssSanitizationMiddleware('description'),
  validationResults,
  catchErrors(updateEventRoute)
);
router.delete(
  '/:id',
  requireAuthentication,
  requireUserCreatedOrIsAdmin,
  catchErrors(deleteEventRoute)
);

router.post(
  '/:id/register',
  requireAuthentication,
  requireRegisteredToBe(false),
  registrationValidationMiddleware('comment'),
  xssSanitizationMiddleware('comment'),
  validationResults,
  catchErrors(registerRoute)
);
router.delete(
  '/:id/register',
  requireAuthentication,
  requireRegisteredToBe(true),
  catchErrors(unregisterRoute)
);
