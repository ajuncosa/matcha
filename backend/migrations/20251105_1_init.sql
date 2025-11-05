CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT not null,
    lastname TEXT not null,
    email TEXT not null
);
