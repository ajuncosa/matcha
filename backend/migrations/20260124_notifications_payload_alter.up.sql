ALTER TABLE notifications
ALTER COLUMN payload TYPE TEXT;

ALTER TABLE notifications
RENAME COLUMN payload TO text;

