INSERT INTO users (name, username, password, admin) VALUES ('Admin', 'admin', '$2a$10$kqew6qrEhBJJAz86GoC.Ju6YqS61POVNieMzbz.RMoyr5CP.OwdGG', TRUE);

INSERT INTO events (creator_id, name, slug, description) VALUES (1, 'Forritarahittingur í febrúar', 'forritarahittingur-i-februar', 'Forritarar hittast í febrúar og forrita saman eitthvað frábært.');
INSERT INTO events (creator_id, name, slug, description) VALUES (1, 'Hönnuðahittingur í mars', 'honnudahittingur-i-mars', 'Spennandi hittingur hönnuða í Hönnunarmars.');
INSERT INTO events (creator_id, name, slug, description) VALUES (1, 'Verkefnastjórahittingur í apríl', 'verkefnastjorahittingur-i-april', 'Virkilega vel verkefnastýrður hittingur.');

INSERT INTO registrations (user_id, comment, event_id) VALUES (1, 'Mjög gaman', 1);
INSERT INTO registrations (user_id, comment, event_id) VALUES (1, 'Hlakka til!', 2);
INSERT INTO registrations (user_id, comment, event_id) VALUES (1, 'Vonandi verður honum vel stýrt!', 3);
