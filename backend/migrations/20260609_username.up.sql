ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50);
UPDATE users SET username = LOWER(name) || id::text WHERE username IS NULL;
ALTER TABLE users ALTER COLUMN username SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE(username);
