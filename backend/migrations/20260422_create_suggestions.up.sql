CREATE TABLE IF NOT EXISTS "suggestions" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "suggested_user" INTEGER NOT NULL,
    "distance_between" NUMERIC(10,1) NOT NULL,
    "shared_tags_ids" INTEGER[],
    UNIQUE (user_id, suggested_user)
);
