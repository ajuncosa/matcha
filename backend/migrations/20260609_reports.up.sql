CREATE TABLE IF NOT EXISTS "reports" (
  "id" SERIAL NOT NULL UNIQUE,
  "reporter_user_id" BIGINT NOT NULL REFERENCES users(id),
  "reported_user_id" BIGINT NOT NULL REFERENCES users(id),
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY("id")
);
