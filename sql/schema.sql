DROP TABLE IF EXISTS public.registrations;
DROP TABLE IF EXISTS public.events;
DROP TABLE IF EXISTS public.users;

CREATE TABLE public.users (
  id SERIAL PRIMARY KEY,
  name character varying(64) NOT NULL,
  username character varying(64) UNIQUE NOT NULL,
  password character varying(256) NOT NULL,
  admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE public.events (
  id SERIAL PRIMARY KEY,
  creator_id INTEGER NOT NULL,
  name VARCHAR(64) NOT NULL UNIQUE,
  slug VARCHAR(64) NOT NULL UNIQUE,
  description TEXT,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT creator_id FOREIGN KEY (creator_id) REFERENCES users (id)
);

CREATE TABLE public.registrations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  comment TEXT,
  event_id INTEGER NOT NULL,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT event_id FOREIGN KEY (event_id) REFERENCES events (id),
  CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES users (id)
);
